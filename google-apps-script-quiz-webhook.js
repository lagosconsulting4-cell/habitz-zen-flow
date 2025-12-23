/**
 * Google Apps Script - Quiz Webhook Handler
 *
 * Como usar:
 * 1. Criar novo Google Apps Script em: https://script.google.com
 * 2. Colar este código
 * 3. Clicar em "Deploy" -> "New deployment" -> "Web app"
 * 4. Configurar:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copiar a URL gerada
 * 6. Usar essa URL na edge function
 */

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CONFIG = {
  // Email para receber notificações
  EMAIL_TO: "scalewithlumen@gmail.com",

  // Nome da planilha (será criada automaticamente)
  SHEET_NAME: "Quiz Leads - Habitz",

  // Assunto do email
  EMAIL_SUBJECT_PREFIX: "🎉 Novo Lead BORA:",
};

// ============================================================================
// FUNÇÃO PRINCIPAL - Recebe POST do webhook
// ============================================================================

function doPost(e) {
  try {
    // Parse JSON data
    const data = JSON.parse(e.postData.contents);

    // Validar campos obrigatórios
    if (!data.name || !data.email || !data.phone) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing required fields"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Salvar na planilha
    saveToSheet(data);

    // 2. Enviar email
    sendEmail(data);

    // Retornar sucesso
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Lead saved and email sent"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// SALVAR NA PLANILHA
// ============================================================================

function saveToSheet(data) {
  try {
    const ss = getOrCreateSpreadsheet();
    const sheet = ss.getSheets()[0];

    // Se é a primeira vez, adicionar headers
    if (sheet.getLastRow() === 0) {
      const headers = [
        "Data/Hora",
        "Nome",
        "Email",
        "Telefone",
        "Idade",
        "Profissão",
        "Gênero",
        "Faixa Financeira",
        "Objetivo",
        "Tempo Disponível",
        "Pico de Energia",
        "Horário de Trabalho",
        "Desafios",
        "Sentimento Consistência",
        "Projeção Futura",
        "Anos Prometendo",
        "Converteu?",
        "Todas as Respostas (JSON)"
      ];
      sheet.appendRow(headers);

      // Formatar header
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#A3E635");
      headerRange.setFontWeight("bold");
      headerRange.setFontColor("#1f2937");
    }

    // Adicionar nova linha com os dados
    const row = [
      new Date(),
      data.name || "",
      data.email || "",
      data.phone || "",
      data.age_range || "",
      data.profession || "",
      data.gender || "",
      data.financial_range || "",
      data.objective || "",
      data.time_available || "",
      data.energy_peak || "",
      data.work_schedule || "",
      Array.isArray(data.challenges) ? data.challenges.join(", ") : "",
      data.consistency_feeling || "",
      data.projected_feeling || "",
      data.years_promising || "",
      "Não", // Converteu? - Inicialmente não
      JSON.stringify(data) // Backup completo dos dados
    ];

    sheet.appendRow(row);

    // Auto-ajustar colunas
    sheet.autoResizeColumns(1, row.length);

    Logger.log("✅ Data saved to sheet");

  } catch (error) {
    Logger.log("Error saving to sheet: " + error.toString());
    throw error;
  }
}

// ============================================================================
// OBTER OU CRIAR PLANILHA
// ============================================================================

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(CONFIG.SHEET_NAME);

  if (files.hasNext()) {
    // Planilha já existe
    const file = files.next();
    return SpreadsheetApp.open(file);
  } else {
    // Criar nova planilha
    const ss = SpreadsheetApp.create(CONFIG.SHEET_NAME);
    Logger.log("Created new spreadsheet: " + ss.getUrl());
    return ss;
  }
}

// ============================================================================
// ENVIAR EMAIL
// ============================================================================

function sendEmail(data) {
  try {
    const subject = `${CONFIG.EMAIL_SUBJECT_PREFIX} ${data.name} (${data.email})`;

    const htmlBody = buildEmailHtml(data);

    GmailApp.sendEmail(
      CONFIG.EMAIL_TO,
      subject,
      "", // texto plano (vazio porque usamos HTML)
      {
        htmlBody: htmlBody,
        name: "BORA Quiz System"
      }
    );

    Logger.log("✅ Email sent to " + CONFIG.EMAIL_TO);

  } catch (error) {
    Logger.log("Error sending email: " + error.toString());
    throw error;
  }
}

// ============================================================================
// CONSTRUIR HTML DO EMAIL
// ============================================================================

function buildEmailHtml(data) {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #A3E635 0%, #84CC16 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0 0; opacity: 0.95; font-size: 14px; }
    .content { padding: 30px; }
    .section { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #A3E635; }
    .section h3 { margin-top: 0; color: #1f2937; font-size: 16px; }
    .field { margin: 8px 0; font-size: 14px; }
    .label { font-weight: 600; color: #4b5563; }
    .value { color: #1f2937; margin-left: 8px; }
    .badge { display: inline-block; background: #A3E635; color: #1f2937; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin: 4px 4px 4px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .cta { background: #fef3c7; border-left-color: #f59e0b; }
    .cta p { margin: 0; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Novo Lead do Quiz BORA!</h1>
      <p>Alguém completou o quiz e está pronto para assinar</p>
    </div>

    <div class="content">
      <div class="section">
        <h3>📋 Dados Pessoais</h3>
        <div class="field"><span class="label">Nome:</span><span class="value">${data.name}</span></div>
        <div class="field"><span class="label">Email:</span><span class="value"><a href="mailto:${data.email}">${data.email}</a></span></div>
        <div class="field"><span class="label">Telefone:</span><span class="value"><a href="tel:${data.phone}">${data.phone}</a></span></div>
      </div>
  `;

  // Perfil
  if (data.age_range || data.profession || data.gender || data.financial_range) {
    html += `
      <div class="section">
        <h3>👤 Perfil</h3>
    `;
    if (data.age_range) html += `<div class="field"><span class="label">Idade:</span><span class="value">${data.age_range}</span></div>`;
    if (data.profession) html += `<div class="field"><span class="label">Profissão:</span><span class="value">${data.profession}</span></div>`;
    if (data.gender) html += `<div class="field"><span class="label">Gênero:</span><span class="value">${data.gender}</span></div>`;
    if (data.financial_range) html += `<div class="field"><span class="label">Faixa Financeira:</span><span class="value">${data.financial_range}</span></div>`;
    html += `</div>`;
  }

  // Preferências
  if (data.objective || data.time_available || data.energy_peak || data.work_schedule) {
    html += `
      <div class="section">
        <h3>🎯 Preferências</h3>
    `;
    if (data.objective) html += `<div class="field"><span class="label">Objetivo:</span><span class="value">${data.objective}</span></div>`;
    if (data.time_available) html += `<div class="field"><span class="label">Tempo Disponível:</span><span class="value">${data.time_available}</span></div>`;
    if (data.energy_peak) html += `<div class="field"><span class="label">Pico de Energia:</span><span class="value">${data.energy_peak}</span></div>`;
    if (data.work_schedule) html += `<div class="field"><span class="label">Horário de Trabalho:</span><span class="value">${data.work_schedule}</span></div>`;
    html += `</div>`;
  }

  // Desafios
  if (data.challenges && data.challenges.length > 0) {
    html += `
      <div class="section">
        <h3>💪 Desafios</h3>
        <div>
    `;
    data.challenges.forEach(challenge => {
      html += `<span class="badge">${challenge}</span>`;
    });
    html += `
        </div>
      </div>
    `;
  }

  // Estado Emocional
  if (data.consistency_feeling || data.projected_feeling || data.years_promising) {
    html += `
      <div class="section">
        <h3>💭 Estado Emocional</h3>
    `;
    if (data.consistency_feeling) html += `<div class="field"><span class="label">Sentimento de Consistência:</span><span class="value">${data.consistency_feeling}</span></div>`;
    if (data.projected_feeling) html += `<div class="field"><span class="label">Como se Projeta:</span><span class="value">${data.projected_feeling}</span></div>`;
    if (data.years_promising) html += `<div class="field"><span class="label">Anos Prometendo:</span><span class="value">${data.years_promising}</span></div>`;
    html += `</div>`;
  }

  // CTA
  html += `
      <div class="section cta">
        <h3>🚀 Próximos Passos</h3>
        <p>Este lead completou o quiz e está na página de assinatura. Entre em contato em até 24h para aumentar conversão!</p>
      </div>
    </div>

    <div class="footer">
      <p>Este email foi gerado automaticamente pelo sistema BORA</p>
      <p>Habitz · Quiz Landing Page · ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

// ============================================================================
// FUNÇÃO DE TESTE (executar manualmente para testar)
// ============================================================================

function testWebhook() {
  const testData = {
    name: "João Silva",
    email: "joao@teste.com",
    phone: "(11) 99999-9999",
    age_range: "25-34 anos",
    profession: "Designer",
    gender: "Masculino",
    financial_range: "R$ 3.000 - R$ 6.000",
    objective: "Produtividade",
    time_available: "15-30 minutos",
    energy_peak: "Manhã",
    work_schedule: "Comercial (9h-18h)",
    challenges: ["Procrastinação", "Falta de foco", "Ansiedade"],
    consistency_feeling: "Frustrante",
    projected_feeling: "Esperançoso",
    years_promising: "1-3 anos"
  };

  saveToSheet(testData);
  sendEmail(testData);

  Logger.log("✅ Test completed! Check your email and spreadsheet.");
}
