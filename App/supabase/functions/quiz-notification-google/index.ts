import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// URL do Google Apps Script - CONFIGURAR DEPOIS DO DEPLOY
const GOOGLE_APPS_SCRIPT_URL = Deno.env.get("GOOGLE_APPS_SCRIPT_URL") || "";

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const quizData = await req.json();

    // Validate required fields
    if (!quizData.name || !quizData.email || !quizData.phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if Google Apps Script URL is configured
    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.warn("GOOGLE_APPS_SCRIPT_URL not configured");
      return new Response(
        JSON.stringify({
          success: true,
          warning: "Notification not sent (Google Apps Script URL not configured)"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send data to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Apps Script error:", errorText);
      throw new Error(`Google Apps Script returned ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Notification sent via Google Apps Script:", result);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Lead saved and email sent",
        details: result
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in quiz-notification function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
