#!/usr/bin/env node

/**
 * Gera o arquivo Doc/fase2-content-updates.sql a partir dos conteúdos markdown
 * localizados em Doc/CONTEUDO-MODULO-*.md.
 *
 * O objetivo é manter o conteúdo escrito apenas nos arquivos markdown e,
 * automaticamente, produzir os comandos SQL que fazem o update na tabela
 * module_lessons.
 */

import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DOC_DIR = path.join(ROOT_DIR, "Doc");
const OUTPUT_FILE = path.join(DOC_DIR, "fase2-content-updates.sql");

const MODULE_DEFINITIONS = [
  { number: 1, lessons: 4, file: "CONTEUDO-MODULO-1.md" },
  { number: 2, lessons: 2, file: "CONTEUDO-MODULO-2.md" },
  { number: 3, lessons: 4, file: "CONTEUDO-MODULO-3.md" },
  { number: 4, lessons: 7, file: "CONTEUDO-MODULO-4.md" },
  { number: 5, lessons: 8, file: "CONTEUDO-MODULO-5.md" },
  { number: 6, lessons: 6, file: "CONTEUDO-MODULO-6.md" },
  { number: 7, lessons: 6, file: "CONTEUDO-MODULO-7.md" },
];

const LESSON_HEADING_REGEX = /^##\s+.*?Aula\s+(\d+):\s*(.+)$/i;
const LESSON_BODY_START_REGEX = /^###\s+/;

const escapeForDollarTag = (value) => value.replace(/[^A-Z0-9_]/gi, "_");

const parseMarkdownLessons = (markdown, expectedLessons, moduleNumber) => {
  const lines = markdown.split(/\r?\n/);
  const lessons = [];
  let currentLesson = null;

  lines.forEach((line) => {
    const match = line.match(LESSON_HEADING_REGEX);
    if (match) {
      if (currentLesson) {
        lessons.push(currentLesson);
      }
      currentLesson = {
        number: parseInt(match[1], 10),
        title: match[2].trim(),
        lines: [],
      };
      return;
    }

    if (currentLesson) {
      currentLesson.lines.push(line);
    }
  });

  if (currentLesson) {
    lessons.push(currentLesson);
  }

  if (lessons.length !== expectedLessons) {
    throw new Error(
      `Módulo ${moduleNumber} deveria ter ${expectedLessons} aulas, ` +
        `mas foram encontradas ${lessons.length}.`
    );
  }

  return lessons.map((lesson, index) => {
    const bodyStartIndex = lesson.lines.findIndex((line) =>
      LESSON_BODY_START_REGEX.test(line)
    );

    const relevantLines =
      bodyStartIndex === -1
        ? lesson.lines
        : lesson.lines.slice(bodyStartIndex);

    const content = relevantLines.join("\n").trim();
    const transcript = `# ${lesson.title}\n\n${content}`;

    return {
      order: index + 1,
      title: lesson.title,
      transcript: transcript.trim(),
    };
  });
};

const buildSqlStatement = (moduleNumber, lessonNumber, transcript) => {
  const dollarTag = `TRANSCRIPT_M${moduleNumber}_L${lessonNumber}`;
  const sanitizedTag = escapeForDollarTag(dollarTag);
  const delimiter = `$${sanitizedTag}$`;

  return [
    `-- Módulo ${moduleNumber}, Aula ${lessonNumber}`,
    `UPDATE public.module_lessons`,
    `SET transcript = ${delimiter}`,
    transcript,
    `${delimiter}`,
    `WHERE module_id = (SELECT id FROM public.program_modules WHERE module_number = ${moduleNumber})`,
    `  AND lesson_number = ${lessonNumber};`,
  ].join("\n");
};

const generateSqlFile = () => {
  const statements = [];

  MODULE_DEFINITIONS.forEach((moduleDef) => {
    const filePath = path.join(DOC_DIR, moduleDef.file);
    const markdown = readFileSync(filePath, "utf-8");
    const lessons = parseMarkdownLessons(
      markdown,
      moduleDef.lessons,
      moduleDef.number
    );

    lessons.forEach((lesson) => {
      statements.push(
        buildSqlStatement(moduleDef.number, lesson.order, lesson.transcript)
      );
    });
  });

  const header = [
    "-- =====================================================",
    "-- Este arquivo é gerado automaticamente por scripts/generate-transcripts-sql.mjs",
    "-- Não edite manualmente. Atualize os arquivos markdown em Doc/CONTEUDO-MODULO-*.md",
    "-- e execute `node scripts/generate-transcripts-sql.mjs` para regenerar este SQL.",
    "-- =====================================================",
    "",
  ].join("\n");

  const content = `${header}${statements.join("\n\n")}\n`;
  writeFileSync(OUTPUT_FILE, content, "utf-8");

  console.log(
    `Arquivo fase2-content-updates.sql gerado com ${statements.length} aulas.`
  );
};

generateSqlFile();
