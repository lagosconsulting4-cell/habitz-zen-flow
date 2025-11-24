/**
 * Script para validar e testar configurações de metas
 * Execute com: npx tsx scripts/test-goal-configs.ts
 */

import {
  HABIT_GOAL_CONFIGS,
  getGoalConfig,
  formatGoalValue,
  getConfigStats,
  validateGoalValue,
} from "../App/src/data/habit-goal-configs";

console.log("🧪 Testando Configurações de Metas Inteligentes\n");
console.log("═".repeat(60));

// Estatísticas gerais
const stats = getConfigStats();
console.log("\n📊 ESTATÍSTICAS GERAIS:");
console.log(`  Total de hábitos: ${stats.total}`);
console.log(`  ├─ Binários (sem meta): ${stats.binary} (${Math.round(stats.binary / stats.total * 100)}%)`);
console.log(`  ├─ Simples (sugestões): ${stats.simple} (${Math.round(stats.simple / stats.total * 100)}%)`);
console.log(`  └─ Avançados (múltiplas unidades): ${stats.advanced} (${Math.round(stats.advanced / stats.total * 100)}%)`);
console.log(`\n  Features:`);
console.log(`  ├─ Com sugestões: ${stats.withSuggestions}`);
console.log(`  ├─ Com validação: ${stats.withValidation}`);
console.log(`  └─ Com texto de ajuda: ${stats.withHelpText}`);

// Testar algumas configs específicas
console.log("\n" + "═".repeat(60));
console.log("\n🎯 EXEMPLOS DE CONFIGURAÇÕES:\n");

// Exemplo 1: Hábito binário
console.log("1️⃣ HÁBITO BINÁRIO (wake_early):");
const wakeEarly = getGoalConfig("wake_early");
console.log(`  ├─ Level: ${wakeEarly?.level}`);
console.log(`  ├─ Unidade: ${wakeEarly?.primaryUnit}`);
console.log(`  └─ Ajuda: ${wakeEarly?.helpText}`);

// Exemplo 2: Hábito simples
console.log("\n2️⃣ HÁBITO SIMPLES (meditate):");
const meditate = getGoalConfig("meditate");
console.log(`  ├─ Level: ${meditate?.level}`);
console.log(`  ├─ Unidade: ${meditate?.primaryUnit}`);
console.log(`  ├─ Valor padrão: ${meditate?.defaultValue} ${meditate?.emoji}`);
console.log(`  ├─ Sugestões: [${meditate?.suggestions?.join(", ")}]`);
console.log(`  ├─ Ajuda: ${meditate?.helpText}`);
console.log(`  └─ Validação:`);
console.log(`      ├─ Min: ${meditate?.validation?.min}`);
console.log(`      ├─ Max: ${meditate?.validation?.max}`);
console.log(`      ├─ Aviso abaixo: ${meditate?.validation?.warnBelow}`);
console.log(`      └─ Aviso acima: ${meditate?.validation?.warnAbove}`);

// Exemplo 3: Hábito avançado
console.log("\n3️⃣ HÁBITO AVANÇADO (walk_run):");
const walkRun = getGoalConfig("walk_run");
console.log(`  ├─ Level: ${walkRun?.level}`);
console.log(`  ├─ Unidade principal: ${walkRun?.primaryUnit}`);
console.log(`  ├─ Unidades alternativas: [${walkRun?.alternativeUnits?.join(", ")}]`);
console.log(`  ├─ Valor padrão: ${walkRun?.defaultValue} ${walkRun?.emoji}`);
console.log(`  ├─ Sugestões: [${walkRun?.suggestions?.join(", ")}]`);
console.log(`  └─ Ajuda: ${walkRun?.helpText}`);

// Exemplo 4: Hábito com label customizado
console.log("\n4️⃣ HÁBITO COM LABEL CUSTOMIZADO (eat_fruits):");
const eatFruits = getGoalConfig("eat_fruits");
console.log(`  ├─ Unidade técnica: ${eatFruits?.primaryUnit}`);
console.log(`  ├─ Label customizado: "${eatFruits?.unitLabel}"`);
console.log(`  ├─ Formatação: ${formatGoalValue(3, "portions", eatFruits)}`);
console.log(`  └─ Ajuda: ${eatFruits?.helpText}`);

// Testar validações
console.log("\n" + "═".repeat(60));
console.log("\n✅ TESTES DE VALIDAÇÃO:\n");

const testCases = [
  { habit: "meditate", value: 2, expected: "warning" },
  { habit: "meditate", value: 10, expected: "ok" },
  { habit: "meditate", value: 90, expected: "warning" },
  { habit: "meditate", value: 150, expected: "invalid" },
  { habit: "walk_run", value: 3000, expected: "warning" },
  { habit: "walk_run", value: 10000, expected: "ok" },
];

testCases.forEach(({ habit, value, expected }) => {
  const result = validateGoalValue(value, habit);
  const status = !result.isValid ? "❌ INVÁLIDO" : result.warning ? "⚠️ WARNING" : "✅ OK";
  console.log(`${status} | ${habit}: ${value} → ${result.warning || "✓"}`);
});

// Listar todos os hábitos por categoria
console.log("\n" + "═".repeat(60));
console.log("\n📋 TODOS OS HÁBITOS POR NÍVEL:\n");

const byLevel = {
  binary: [] as string[],
  simple: [] as string[],
  advanced: [] as string[],
};

Object.entries(HABIT_GOAL_CONFIGS).forEach(([id, config]) => {
  byLevel[config.level].push(id);
});

console.log(`🔘 BINÁRIOS (${byLevel.binary.length}):`);
byLevel.binary.forEach(id => console.log(`   • ${id}`));

console.log(`\n⚙️ SIMPLES (${byLevel.simple.length}):`);
byLevel.simple.forEach(id => console.log(`   • ${id}`));

console.log(`\n🔧 AVANÇADOS (${byLevel.advanced.length}):`);
byLevel.advanced.forEach(id => console.log(`   • ${id}`));

// Verificar consistência
console.log("\n" + "═".repeat(60));
console.log("\n🔍 VERIFICAÇÃO DE CONSISTÊNCIA:\n");

let errors = 0;

Object.entries(HABIT_GOAL_CONFIGS).forEach(([id, config]) => {
  // Binary deve ter unit=none
  if (config.level === "binary" && config.primaryUnit !== "none") {
    console.log(`❌ ${id}: binary deve ter primaryUnit=none`);
    errors++;
  }

  // Simple deve ter suggestions
  if (config.level === "simple" && !config.suggestions) {
    console.log(`❌ ${id}: simple deve ter suggestions`);
    errors++;
  }

  // Advanced deve ter alternativeUnits
  if (config.level === "advanced" && !config.alternativeUnits) {
    console.log(`❌ ${id}: advanced deve ter alternativeUnits`);
    errors++;
  }

  // Todos devem ter helpText
  if (!config.helpText) {
    console.log(`⚠️ ${id}: sem helpText`);
  }
});

if (errors === 0) {
  console.log("✅ Todas as configurações estão consistentes!");
} else {
  console.log(`\n❌ Encontrados ${errors} erros de consistência`);
}

console.log("\n" + "═".repeat(60));
console.log("\n✨ Teste concluído!\n");
