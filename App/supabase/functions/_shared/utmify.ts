/**
 * UTMify API Integration
 *
 * Sends conversion events (Purchase, Subscription) to UTMify
 * UTMify will forward these events to Meta Pixel automatically
 */

export interface UTMifyPurchaseData {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  value: number;
  currency: string;
  transactionId: string;
  productName?: string;
  productId?: string;
  subscriptionId?: string;
  status: "approved" | "pending" | "refunded" | "chargeback" | "cancelled";
}

/**
 * Send Purchase event to UTMify
 * UTMify will forward to Meta Pixel with Purchase event
 */
export async function sendUTMifyPurchase(data: UTMifyPurchaseData): Promise<boolean> {
  const UTMIFY_API_KEY = Deno.env.get("UTMIFY_API_KEY");
  const UTMIFY_PIXEL_ID = Deno.env.get("UTMIFY_PIXEL_ID") || "6928b75029dffcb87ec192fd";

  if (!UTMIFY_API_KEY) {
    console.warn("UTMIFY_API_KEY not configured, skipping UTMify notification");
    return false;
  }

  try {
    const payload = {
      pixelId: UTMIFY_PIXEL_ID,
      email: data.email.toLowerCase(),
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      value: data.value,
      currency: data.currency.toUpperCase(),
      transactionId: data.transactionId,
      productName: data.productName || "Habitz Premium",
      productId: data.productId || "habitz-premium",
      subscriptionId: data.subscriptionId,
      status: data.status,
      eventType: "Purchase",
      source: "stripe",
    };

    console.log("[UTMify] Sending Purchase event:", {
      email: data.email,
      value: data.value,
      transactionId: data.transactionId,
    });

    const response = await fetch("https://api.utmify.com.br/v1/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${UTMIFY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[UTMify] API error:", response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log("[UTMify] Purchase event sent successfully:", result);
    return true;
  } catch (error) {
    console.error("[UTMify] Error sending purchase event:", error);
    return false;
  }
}

/**
 * Send Subscription event to UTMify
 */
export async function sendUTMifySubscription(data: UTMifyPurchaseData): Promise<boolean> {
  // Subscription events use the same endpoint but with different eventType
  const modifiedData = {
    ...data,
  };

  return sendUTMifyPurchase(modifiedData);
}

/**
 * Send Refund event to UTMify
 */
export async function sendUTMifyRefund(data: Omit<UTMifyPurchaseData, 'status'>): Promise<boolean> {
  return sendUTMifyPurchase({
    ...data,
    status: "refunded",
  });
}
