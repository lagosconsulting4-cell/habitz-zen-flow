import { Badge } from "@/components/ui/badge";

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_CONFIG = {
  novo: {
    label: "Novo",
    variant: "default" as const,
    className: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  contactado: {
    label: "Contactado",
    variant: "default" as const,
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  convertido: {
    label: "Convertido",
    variant: "default" as const,
    className: "bg-green-500 hover:bg-green-600 text-white",
  },
  perdido: {
    label: "Perdido",
    variant: "default" as const,
    className: "bg-red-500 hover:bg-red-600 text-white",
  },
} as const;

export const LeadStatusBadge = ({ status, className }: LeadStatusBadgeProps) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
    label: status,
    variant: "outline" as const,
    className: "",
  };

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ""}`}>
      {config.label}
    </Badge>
  );
};
