/**
 * Script para gerar ícones PWA a partir do logo
 * Executa: node scripts/generate-pwa-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT_LOGO = path.join(__dirname, '../../Doc/ChatGPT_Image_25_de_nov._de_2025_12_02_45.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Tamanhos necessários para PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];
const SHORTCUT_SIZE = 96;
const BADGE_SIZE = 72;

// Cores do tema
const BACKGROUND_COLOR = '#65A30D'; // Verde lime para ícones maskable

async function generateIcons() {
  // Garantir que o diretório existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Lendo logo de:', INPUT_LOGO);

  // Verificar se o arquivo existe
  if (!fs.existsSync(INPUT_LOGO)) {
    console.error('Arquivo de logo não encontrado:', INPUT_LOGO);
    process.exit(1);
  }

  // Ler a imagem original
  const originalImage = sharp(INPUT_LOGO);
  const metadata = await originalImage.metadata();
  console.log(`Logo original: ${metadata.width}x${metadata.height}`);

  // Gerar ícones padrão (any purpose)
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);

    await sharp(INPUT_LOGO)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Gerado: icon-${size}.png`);
  }

  // Gerar ícones maskable (com padding e background)
  for (const size of MASKABLE_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-maskable-${size}.png`);
    const innerSize = Math.floor(size * 0.6); // 60% do tamanho para safe zone
    const padding = Math.floor((size - innerSize) / 2);

    // Criar background verde
    const background = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 101, g: 163, b: 13, alpha: 1 } // #65A30D
      }
    }).png().toBuffer();

    // Redimensionar logo
    const resizedLogo = await sharp(INPUT_LOGO)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // Compor imagem final
    await sharp(background)
      .composite([{
        input: resizedLogo,
        top: padding,
        left: padding
      }])
      .png()
      .toFile(outputPath);

    console.log(`✓ Gerado: icon-maskable-${size}.png`);
  }

  // Gerar ícones de atalho
  const shortcuts = ['dashboard', 'create', 'meditation'];
  for (const shortcut of shortcuts) {
    const outputPath = path.join(OUTPUT_DIR, `shortcut-${shortcut}.png`);

    await sharp(INPUT_LOGO)
      .resize(SHORTCUT_SIZE, SHORTCUT_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Gerado: shortcut-${shortcut}.png`);
  }

  // Gerar badge para notificações
  const badgePath = path.join(OUTPUT_DIR, `badge-${BADGE_SIZE}.png`);
  await sharp(INPUT_LOGO)
    .resize(BADGE_SIZE, BADGE_SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(badgePath);
  console.log(`✓ Gerado: badge-${BADGE_SIZE}.png`);

  console.log('\n✅ Todos os ícones PWA foram gerados com sucesso!');
  console.log(`📁 Diretório: ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);
