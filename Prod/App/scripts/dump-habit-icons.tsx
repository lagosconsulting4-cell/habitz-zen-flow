import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { HabitIcons } from "@/components/icons/HabitIcons";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const icons = Object.entries(HabitIcons)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, Component]) => {
    const markup = renderToStaticMarkup(<Component />);
    return { key, markup };
  });

const payload = {
  generatedAt: new Date().toISOString(),
  total: icons.length,
  icons,
};

const outPath = path.resolve(__dirname, "../../Doc/icon-preview-data.json");
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");

console.log(`✅ Exported ${icons.length} habit icons to ${outPath}`);
