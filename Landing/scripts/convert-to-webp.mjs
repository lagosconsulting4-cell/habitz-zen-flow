import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const IMAGES_DIR = './public/images';
const QUALITY = 80; // WebP quality (0-100)

async function convertToWebP(inputPath) {
  const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  try {
    const inputStats = await stat(inputPath);
    const inputSizeMB = (inputStats.size / 1024 / 1024).toFixed(2);

    await sharp(inputPath)
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const outputStats = await stat(outputPath);
    const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`✅ ${basename(inputPath)}: ${inputSizeMB}MB → ${outputSizeMB}MB (${reduction}% menor)`);

    return {
      file: basename(inputPath),
      before: inputStats.size,
      after: outputStats.size,
    };
  } catch (error) {
    console.error(`❌ Erro ao converter ${inputPath}:`, error.message);
    return null;
  }
}

async function processDirectory(dir) {
  const results = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const subResults = await processDirectory(fullPath);
        results.push(...subResults);
      } else if (entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name)) {
        const result = await convertToWebP(fullPath);
        if (result) results.push(result);
      }
    }
  } catch (error) {
    console.error(`Erro ao processar diretório ${dir}:`, error.message);
  }

  return results;
}

async function main() {
  console.log('🖼️  Convertendo imagens para WebP...\n');
  console.log(`📁 Diretório: ${IMAGES_DIR}`);
  console.log(`📊 Qualidade: ${QUALITY}%\n`);

  const results = await processDirectory(IMAGES_DIR);

  if (results.length === 0) {
    console.log('Nenhuma imagem encontrada para converter.');
    return;
  }

  const totalBefore = results.reduce((sum, r) => sum + r.before, 0);
  const totalAfter = results.reduce((sum, r) => sum + r.after, 0);
  const totalReduction = ((1 - totalAfter / totalBefore) * 100).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMO:`);
  console.log(`   Arquivos convertidos: ${results.length}`);
  console.log(`   Tamanho antes: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Tamanho depois: ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Redução total: ${totalReduction}%`);
  console.log('='.repeat(50));
}

main().catch(console.error);
