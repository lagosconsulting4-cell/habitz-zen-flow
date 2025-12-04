/**
 * Edge Function: send-push-notification
 *
 * Sends Web Push notifications to users.
 * Implements RFC 8291 (Message Encryption for Web Push) and RFC 8292 (VAPID).
 *
 * Required Secrets (set via Supabase Dashboard > Edge Functions > Secrets):
 * - VAPID_PUBLIC_KEY: Public VAPID key for push notifications
 * - VAPID_PRIVATE_KEY: Private VAPID key for push notifications
 * - VAPID_SUBJECT: mailto: or https:// URL identifying the sender
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:noreply@example.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY") ?? "";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
};

interface PushPayload {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// ============================================================================
// CRYPTO UTILITIES
// ============================================================================

function base64UrlDecode(str: string): Uint8Array {
  // Add padding if needed
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// ============================================================================
// HKDF Implementation (RFC 5869)
// ============================================================================

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    salt.length > 0 ? salt : new Uint8Array(32),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const prk = await crypto.subtle.sign("HMAC", key, ikm);
  return new Uint8Array(prk);
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    prk,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const blocks = Math.ceil(length / 32);
  const okm = new Uint8Array(blocks * 32);
  let prev = new Uint8Array(0);

  for (let i = 0; i < blocks; i++) {
    const input = concatUint8Arrays(prev, info, new Uint8Array([i + 1]));
    const block = await crypto.subtle.sign("HMAC", key, input);
    prev = new Uint8Array(block);
    okm.set(prev, i * 32);
  }

  return okm.slice(0, length);
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const prk = await hkdfExtract(salt, ikm);
  return hkdfExpand(prk, info, length);
}

// ============================================================================
// WEB PUSH ENCRYPTION (RFC 8291 - aes128gcm)
// ============================================================================

async function encryptPayload(
  payload: string,
  subscription: PushSubscription
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);

  // Decode subscription keys
  const clientPublicKey = base64UrlDecode(subscription.p256dh);
  const clientAuth = base64UrlDecode(subscription.auth);

  // Generate local key pair for ECDH
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Export local public key in uncompressed format
  const localPublicKeyRaw = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);
  const localPublicKey = new Uint8Array(localPublicKeyRaw);

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Derive shared secret using ECDH
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: clientKey },
    localKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  // Generate random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // RFC 8291 Step 1: Derive IKM from shared secret
  // salt = auth_secret (from subscription)
  // ikm = ecdh_secret (shared secret from ECDH)
  // info = "WebPush: info" || 0x00 || ua_public || as_public
  const infoPrefix = encoder.encode("WebPush: info\0");
  const keyInfo = concatUint8Arrays(infoPrefix, clientPublicKey, localPublicKey);
  const ikm = await hkdf(clientAuth, sharedSecret, keyInfo, 32);

  // RFC 8291 Step 2: Derive CEK and nonce from IKM
  // salt = random 16 bytes (generated above)
  // ikm = IKM from step 1
  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\0");
  const nonceInfo = encoder.encode("Content-Encoding: nonce\0");
  const cek = await hkdf(salt, ikm, cekInfo, 16);
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);

  // Add padding (1 byte minimum with 0x02 delimiter)
  const paddedPayload = concatUint8Arrays(payloadBytes, new Uint8Array([2]));

  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey(
    "raw",
    cek,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, tagLength: 128 },
    aesKey,
    paddedPayload
  );

  return {
    encrypted: new Uint8Array(ciphertext),
    salt,
    localPublicKey,
  };
}

function createAes128gcmHeader(salt: Uint8Array, localPublicKey: Uint8Array, recordSize: number): Uint8Array {
  // Header format: salt (16) || rs (4) || idlen (1) || keyid (65)
  const header = new Uint8Array(16 + 4 + 1 + 65);

  // Salt (16 bytes)
  header.set(salt, 0);

  // Record size (4 bytes, big-endian)
  const rs = new DataView(header.buffer, 16, 4);
  rs.setUint32(0, recordSize, false);

  // Key ID length (1 byte) - 65 for uncompressed P-256 public key
  header[20] = 65;

  // Key ID (local public key, 65 bytes)
  header.set(localPublicKey, 21);

  return header;
}

// ============================================================================
// VAPID AUTHENTICATION (RFC 8292)
// ============================================================================

async function createVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<string> {
  const encoder = new TextEncoder();

  // Create JWT header and claims
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const audience = new URL(endpoint).origin;
  const claims = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: vapidSubject,
  };

  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const claimsB64 = base64UrlEncode(encoder.encode(JSON.stringify(claims)));
  const unsignedToken = `${headerB64}.${claimsB64}`;

  // Import private key for signing
  const privateKeyBytes = base64UrlDecode(vapidPrivateKey);

  // Convert raw private key to JWK format for import
  const publicKeyBytes = base64UrlDecode(vapidPublicKey);
  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: base64UrlEncode(publicKeyBytes.slice(1, 33)),
    y: base64UrlEncode(publicKeyBytes.slice(33, 65)),
    d: base64UrlEncode(privateKeyBytes),
  };

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Sign the token
  const signatureBuffer = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  // Convert DER signature to raw format (r || s)
  const signature = new Uint8Array(signatureBuffer);
  const jwt = `${unsignedToken}.${base64UrlEncode(signature)}`;

  return `vapid t=${jwt}, k=${vapidPublicKey}`;
}

// ============================================================================
// SEND WEB PUSH
// ============================================================================

async function sendWebPush(
  subscription: PushSubscription,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; status: number; error?: string }> {
  try {
    // Encrypt the payload
    const { encrypted, salt, localPublicKey } = await encryptPayload(payload, subscription);

    // Create the aes128gcm content header
    const recordSize = encrypted.length + 86; // header size + ciphertext
    const header = createAes128gcmHeader(salt, localPublicKey, recordSize);

    // Combine header and encrypted content
    const body = concatUint8Arrays(header, encrypted);

    // Create VAPID authorization header
    const authorization = await createVapidAuthHeader(
      subscription.endpoint,
      vapidPublicKey,
      vapidPrivateKey,
      vapidSubject
    );

    // Send the request
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "Content-Length": body.length.toString(),
        "TTL": "86400",
        "Authorization": authorization,
      },
      body: body,
    });

    if (response.ok || response.status === 201) {
      return { success: true, status: response.status };
    } else {
      const errorText = await response.text();
      console.error(`Push failed: ${response.status} - ${errorText}`);
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.error("Error sending push:", error);
    return { success: false, status: 0, error: String(error) };
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check environment variables
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variables:", {
      hasVapidPublic: !!VAPID_PUBLIC_KEY,
      hasVapidPrivate: !!VAPID_PRIVATE_KEY,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
    });
    return new Response(JSON.stringify({ error: "Function misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: PushPayload = await req.json();

    // Validate payload
    if (!payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: "Missing title or body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!payload.userId && (!payload.userIds || payload.userIds.length === 0)) {
      return new Response(JSON.stringify({ error: "Missing userId or userIds" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user IDs to notify
    const userIds = payload.userIds || [payload.userId!];

    // Fetch subscriptions for these users
    const { data: subscriptions, error: dbError } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, user_id")
      .in("user_id", userIds);

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        sent: 0,
        message: "No subscriptions found for users",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192.png",
      badge: payload.badge || "/icons/badge-72.png",
      tag: payload.tag || "bora-notification",
      data: payload.data || {},
      actions: payload.actions || [],
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const result = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          notificationPayload,
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY,
          VAPID_SUBJECT
        );

        // If subscription is invalid (410 Gone or 404), remove it
        if (result.status === 410 || result.status === 404) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
          console.log(`Removed invalid subscription: ${sub.endpoint}`);
        }

        return { ...result, userId: sub.user_id };
      })
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && (r.value as { success: boolean }).success
    ).length;
    const failed = results.length - sent;

    // Get detailed errors for debugging
    const errors = results
      .filter((r) => r.status === "fulfilled" && !(r.value as { success: boolean }).success)
      .map((r) => (r as PromiseFulfilledResult<{ error?: string; userId: string }>).value);

    console.log(`Push notifications: ${sent} sent, ${failed} failed`, { errors });

    return new Response(JSON.stringify({
      success: true,
      sent,
      failed,
      total: results.length,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
