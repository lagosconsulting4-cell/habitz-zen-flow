import type { Lead } from "@/hooks/useLeads";

/**
 * Converts an array of leads to CSV format and triggers download
 */
export const exportLeadsToCSV = (leads: Lead[], filename: string = "leads.csv") => {
  if (leads.length === 0) {
    console.warn("No leads to export");
    return;
  }

  // Define CSV columns
  const columns = [
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telefone" },
    { key: "age_range", label: "Faixa Etária" },
    { key: "profession", label: "Profissão" },
    { key: "work_schedule", label: "Horário de Trabalho" },
    { key: "gender", label: "Gênero" },
    { key: "financial_range", label: "Faixa Salarial" },
    { key: "energy_peak", label: "Pico de Energia" },
    { key: "time_available", label: "Tempo Disponível" },
    { key: "objective", label: "Objetivo" },
    { key: "consistency_feeling", label: "Sentimento Consistência" },
    { key: "projected_feeling", label: "Sentimento Projetado" },
    { key: "years_promising", label: "Anos Prometendo" },
    { key: "follow_up_status", label: "Status" },
    { key: "notes", label: "Notas" },
    { key: "tags", label: "Tags" },
    { key: "source", label: "Origem" },
    { key: "utm_source", label: "UTM Source" },
    { key: "utm_medium", label: "UTM Medium" },
    { key: "utm_campaign", label: "UTM Campaign" },
    { key: "converted_to_customer", label: "Convertido" },
    { key: "created_at", label: "Data de Criação" },
  ];

  // Create CSV header
  const header = columns.map((col) => `"${col.label}"`).join(",");

  // Create CSV rows
  const rows = leads.map((lead) => {
    return columns
      .map((col) => {
        const value = lead[col.key as keyof Lead];

        // Handle different value types
        if (value === null || value === undefined) {
          return '""';
        }

        if (typeof value === "boolean") {
          return value ? '"Sim"' : '"Não"';
        }

        if (Array.isArray(value)) {
          return `"${value.join(", ")}"`;
        }

        if (typeof value === "object") {
          return `"${JSON.stringify(value)}"`;
        }

        // Escape quotes and wrap in quotes
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",");
  });

  // Combine header and rows
  const csvContent = [header, ...rows].join("\n");

  // Create blob and trigger download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export selected leads based on their IDs
 */
export const exportSelectedLeads = (
  allLeads: Lead[],
  selectedIds: string[],
  filename: string = "leads-selecionados.csv"
) => {
  const selectedLeads = allLeads.filter((lead) => selectedIds.includes(lead.id));
  exportLeadsToCSV(selectedLeads, filename);
};
