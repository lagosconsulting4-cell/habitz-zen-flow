/**
 * Script de Validação - Sistema Smart Goal Cards
 *
 * Valida:
 * - Estrutura de dados (49 hábitos)
 * - Configurações de cada hábito
 * - Distribuição de levels (binary/simple/advanced)
 * - Componentes exportados corretamente
 */

import {
  HABIT_GOAL_CONFIGS,
  getGoalConfig,
  getUnitLabel,
  formatGoalValue,
  validateGoalValue,
  type GoalLevel
} from "../App/src/data/habit-goal-configs";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  console.log("\n" + "=".repeat(60));
  log("cyan", `📋 ${title}`);
  console.log("=".repeat(60));
}

// Validation Results
interface ValidationResult {
  passed: number;
  failed: number;
  warnings: number;
  errors: string[];
}

const results: ValidationResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
};

function assert(condition: boolean, message: string) {
  if (condition) {
    results.passed++;
    log("green", `✅ ${message}`);
  } else {
    results.failed++;
    results.errors.push(message);
    log("red", `❌ ${message}`);
  }
}

function warn(message: string) {
  results.warnings++;
  log("yellow", `⚠️  ${message}`);
}

// ============================================================================
// Test 1: Verificar Estrutura de Dados
// ============================================================================

section("Test 1: Estrutura de Dados");

const habitIds = Object.keys(HABIT_GOAL_CONFIGS);
const totalHabits = habitIds.length;

assert(
  totalHabits === 49,
  `Total de hábitos configurados: ${totalHabits} (esperado: 49)`
);

// Count by level
const levelCounts = {
  binary: 0,
  simple: 0,
  advanced: 0,
};

habitIds.forEach((habitId) => {
  const config = getGoalConfig(habitId);
  levelCounts[config.level]++;
});

assert(
  levelCounts.binary === 15,
  `Hábitos Binary: ${levelCounts.binary} (esperado: 15)`
);

assert(
  levelCounts.simple === 22,
  `Hábitos Simple: ${levelCounts.simple} (esperado: 22)`
);

assert(
  levelCounts.advanced === 12,
  `Hábitos Advanced: ${levelCounts.advanced} (esperado: 12)`
);

// ============================================================================
// Test 2: Validar Configurações Individuais
// ============================================================================

section("Test 2: Validações de Configuração");

habitIds.forEach((habitId) => {
  const config = getGoalConfig(habitId);

  // Verify level is valid
  assert(
    ["binary", "simple", "advanced"].includes(config.level),
    `${habitId}: level válido (${config.level})`
  );

  // Verify primaryUnit
  assert(
    config.primaryUnit !== undefined,
    `${habitId}: possui primaryUnit (${config.primaryUnit})`
  );

  // Binary habits must have unit "none"
  if (config.level === "binary") {
    assert(
      config.primaryUnit === "none",
      `${habitId}: binary com unit "none"`
    );
  }

  // Simple habits must have suggestions
  if (config.level === "simple") {
    if (!config.suggestions || config.suggestions.length !== 3) {
      warn(`${habitId}: simple sem 3 sugestões`);
    }
  }

  // Advanced habits must have alternativeUnits
  if (config.level === "advanced") {
    if (!config.alternativeUnits || config.alternativeUnits.length === 0) {
      warn(`${habitId}: advanced sem alternativeUnits`);
    }
  }

  // Verify defaultValue for non-binary
  if (config.level !== "binary") {
    assert(
      config.defaultValue !== undefined && config.defaultValue > 0,
      `${habitId}: possui defaultValue válido (${config.defaultValue})`
    );
  }

  // Verify validation ranges
  if (config.validation) {
    assert(
      config.validation.min < config.validation.max,
      `${habitId}: validation.min < validation.max`
    );

    if (config.validation.warnBelow !== undefined) {
      assert(
        config.validation.warnBelow < (config.defaultValue || 0),
        `${habitId}: warnBelow < defaultValue`
      );
    }

    if (config.validation.warnAbove !== undefined) {
      assert(
        config.validation.warnAbove > (config.defaultValue || 0),
        `${habitId}: warnAbove > defaultValue`
      );
    }
  }
});

// ============================================================================
// Test 3: Helper Functions
// ============================================================================

section("Test 3: Helper Functions");

// Test getUnitLabel
const unitLabelTests = [
  { unit: "minutes", expected: "min" },
  { unit: "hours", expected: "h" },
  { unit: "steps", expected: "passos" },
  { unit: "km", expected: "km" },
  { unit: "pages", expected: "pág" },
  { unit: "liters", expected: "L" },
  { unit: "none", expected: "" },
];

unitLabelTests.forEach(({ unit, expected }) => {
  const config = getGoalConfig("meditate"); // dummy config
  const label = getUnitLabel(unit as any, config);
  assert(
    label === expected,
    `getUnitLabel("${unit}") === "${expected}"`
  );
});

// Test formatGoalValue
const formatTests = [
  { value: 10, unit: "minutes", expected: "10 min" },
  { value: 10000, unit: "steps", expected: "10.000 passos" },
  { value: 5, unit: "km", expected: "5 km" },
  { value: 30, unit: "pages", expected: "30 pág" },
  { value: 2, unit: "liters", expected: "2 L" },
];

formatTests.forEach(({ value, unit, expected }) => {
  const config = getGoalConfig("meditate");
  const formatted = formatGoalValue(value, unit as any, config);
  assert(
    formatted === expected,
    `formatGoalValue(${value}, "${unit}") === "${expected}"`
  );
});

// Test validateGoalValue
const validationTests = [
  { habitId: "meditate", value: 2, shouldWarn: true },
  { habitId: "meditate", value: 10, shouldWarn: false },
  { habitId: "meditate", value: 90, shouldWarn: true },
];

validationTests.forEach(({ habitId, value, shouldWarn }) => {
  const validation = validateGoalValue(value, habitId);
  if (shouldWarn) {
    assert(
      validation.warning !== undefined,
      `validateGoalValue("${habitId}", ${value}) deve ter warning`
    );
  } else {
    assert(
      validation.warning === undefined,
      `validateGoalValue("${habitId}", ${value}) não deve ter warning`
    );
  }
});

// ============================================================================
// Test 4: Specific Habit Configurations
// ============================================================================

section("Test 4: Configurações Específicas");

// Test: meditate (simple)
const meditateConfig = getGoalConfig("meditate");
assert(meditateConfig.level === "simple", "meditate: level simple");
assert(meditateConfig.primaryUnit === "minutes", "meditate: unit minutes");
assert(meditateConfig.defaultValue === 10, "meditate: default 10");
assert(
  meditateConfig.suggestions?.length === 3,
  "meditate: 3 sugestões"
);
assert(meditateConfig.emoji === "🧘", "meditate: emoji correto");

// Test: walk_run (advanced)
const walkRunConfig = getGoalConfig("walk_run");
assert(walkRunConfig.level === "advanced", "walk_run: level advanced");
assert(walkRunConfig.primaryUnit === "steps", "walk_run: primary steps");
assert(
  walkRunConfig.alternativeUnits?.includes("km") &&
  walkRunConfig.alternativeUnits?.includes("minutes"),
  "walk_run: alternativeUnits corretas"
);
assert(walkRunConfig.defaultValue === 10000, "walk_run: default 10000");
assert(walkRunConfig.emoji === "🏃", "walk_run: emoji correto");

// Test: wake_early (binary)
const wakeEarlyConfig = getGoalConfig("wake_early");
assert(wakeEarlyConfig.level === "binary", "wake_early: level binary");
assert(wakeEarlyConfig.primaryUnit === "none", "wake_early: unit none");
assert(wakeEarlyConfig.defaultValue === undefined, "wake_early: no default");
assert(wakeEarlyConfig.emoji === "☀️", "wake_early: emoji correto");

// ============================================================================
// Test 5: Component Exports
// ============================================================================

section("Test 5: Component Exports");

// This would require dynamic imports in a real test environment
// For now, we'll just validate the structure

log("blue", "ℹ️  Componentes devem ser validados via testes de integração");
log("blue", "   - BinaryGoalCard.tsx");
log("blue", "   - SimpleGoalCard.tsx");
log("blue", "   - AdvancedGoalCard.tsx");
log("blue", "   - SmartGoalCard.tsx");
log("blue", "   - index.ts (barrel export)");

// ============================================================================
// Test 6: Edge Cases
// ============================================================================

section("Test 6: Edge Cases");

// Test: Non-existent habit
try {
  getGoalConfig("non_existent_habit" as any);
  warn("getGoalConfig deve lançar erro para hábito inexistente");
} catch (error) {
  log("green", "✅ getGoalConfig lança erro para hábito inexistente");
  results.passed++;
}

// Test: Invalid unit
const invalidUnit = getUnitLabel("invalid_unit" as any, meditateConfig);
assert(
  invalidUnit === "invalid_unit",
  "getUnitLabel retorna unit original para unit inválida"
);

// ============================================================================
// Final Results
// ============================================================================

section("Resultados Finais");

console.log(`
Total de Testes: ${results.passed + results.failed}
✅ Passou: ${results.passed}
❌ Falhou: ${results.failed}
⚠️  Warnings: ${results.warnings}
`);

if (results.failed > 0) {
  log("red", "\n❌ FALHAS DETECTADAS:\n");
  results.errors.forEach((error) => {
    log("red", `   - ${error}`);
  });
  process.exit(1);
} else {
  log("green", "\n✅ TODOS OS TESTES PASSARAM!\n");
  log("cyan", "Sistema Smart Goal Cards validado com sucesso.");
  log("cyan", `${totalHabits} hábitos configurados corretamente.`);
  log("cyan", `Distribuição: ${levelCounts.binary} binary, ${levelCounts.simple} simple, ${levelCounts.advanced} advanced`);

  if (results.warnings > 0) {
    log("yellow", `\n⚠️  ${results.warnings} warnings detectados - verifique logs acima.`);
  }

  process.exit(0);
}
