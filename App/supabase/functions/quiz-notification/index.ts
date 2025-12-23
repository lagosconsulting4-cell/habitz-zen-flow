import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ADMIN_EMAIL = "scalewithlumen@gmail.com";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #A3E635 0%, #84CC16 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #A3E635; }
    .section h3 { margin-top: 0; color: #1f2937; }
    .field { margin: 10px 0; }
    .label { font-weight: 600; color: #4b5563; }
    .value { color: #1f2937; margin-left: 10px; }
    .badge { display: inline-block; background: #A3E635; color: #1f2937; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Novo Lead do Quiz BORA!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Alguém completou o quiz e está pronto para assinar</p>
    </div>

    <div class="content">
      <div class="section">
        <h3>📋 Dados Pessoais</h3>
        <div class="field"><span class="label">Nome:</span><span class="value">${quizData.name}</span></div>
        <div class="field"><span class="label">Email:</span><span class="value">${quizData.email}</span></div>
        <div class="field"><span class="label">Telefone:</span><span class="value">${quizData.phone}</span></div>
      </div>

      ${quizData.age_range || quizData.profession || quizData.gender || quizData.financial_range ? `
      <div class="section">
        <h3>👤 Perfil</h3>
        ${quizData.age_range ? `<div class="field"><span class="label">Idade:</span><span class="value">${quizData.age_range}</span></div>` : ''}
        ${quizData.profession ? `<div class="field"><span class="label">Profissão:</span><span class="value">${quizData.profession}</span></div>` : ''}
        ${quizData.gender ? `<div class="field"><span class="label">Gênero:</span><span class="value">${quizData.gender}</span></div>` : ''}
        ${quizData.financial_range ? `<div class="field"><span class="label">Faixa Financeira:</span><span class="value">${quizData.financial_range}</span></div>` : ''}
      </div>
      ` : ''}

      ${quizData.objective || quizData.time_available || quizData.energy_peak ? `
      <div class="section">
        <h3>🎯 Preferências</h3>
        ${quizData.objective ? `<div class="field"><span class="label">Objetivo:</span><span class="value">${quizData.objective}</span></div>` : ''}
        ${quizData.time_available ? `<div class="field"><span class="label">Tempo Disponível:</span><span class="value">${quizData.time_available}</span></div>` : ''}
        ${quizData.energy_peak ? `<div class="field"><span class="label">Pico de Energia:</span><span class="value">${quizData.energy_peak}</span></div>` : ''}
        ${quizData.work_schedule ? `<div class="field"><span class="label">Horário de Trabalho:</span><span class="value">${quizData.work_schedule}</span></div>` : ''}
      </div>
      ` : ''}

      ${quizData.challenges && quizData.challenges.length > 0 ? `
      <div class="section">
        <h3>💪 Desafios</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${quizData.challenges.map((challenge: string) => `<span class="badge">${challenge}</span>`).join('')}
        </div>
      </div>
      ` : ''}

      ${quizData.consistency_feeling || quizData.projected_feeling || quizData.years_promising ? `
      <div class="section">
        <h3>💭 Estado Emocional</h3>
        ${quizData.consistency_feeling ? `<div class="field"><span class="label">Sentimento de Consistência:</span><span class="value">${quizData.consistency_feeling}</span></div>` : ''}
        ${quizData.projected_feeling ? `<div class="field"><span class="label">Como se Projeta:</span><span class="value">${quizData.projected_feeling}</span></div>` : ''}
        ${quizData.years_promising ? `<div class="field"><span class="label">Anos Prometendo:</span><span class="value">${quizData.years_promising}</span></div>` : ''}
      </div>
      ` : ''}

      <div class="section" style="background: #fef3c7; border-left-color: #f59e0b;">
        <h3>🚀 Próximos Passos</h3>
        <p style="margin: 0;">Este lead completou o quiz e está na página de assinatura. Entre em contato em até 24h para aumentar conversão!</p>
      </div>
    </div>

    <div class="footer">
      <p>Este email foi gerado automaticamente pelo sistema BORA</p>
      <p>Habitz · Quiz Landing Page · ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, email will not be sent");
      return new Response(
        JSON.stringify({ success: true, warning: "Email not sent (API key missing)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BORA Quiz <noreply@habitz.life>",
        to: [ADMIN_EMAIL],
        subject: `🎉 Novo Lead: ${quizData.name} (${quizData.email})`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Failed to send email via Resend:", errorText);
      throw new Error(`Resend API error: ${emailResponse.status}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
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
