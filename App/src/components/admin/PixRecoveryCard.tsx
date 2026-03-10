import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PixRecoveryLead } from "@/hooks/usePixRecovery";

interface PixRecoveryCardProps {
  lead: PixRecoveryLead;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

const urgencyBadge = (urgency: string) => {
  switch (urgency) {
    case "fresh":
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0 text-[10px]">24h</Badge>;
    case "recent":
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0 text-[10px]">3d</Badge>;
    case "aging":
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-0 text-[10px]">7d</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px]">7d+</Badge>;
  }
};

const productBadge = (product: string) => {
  switch (product) {
    case "Bora App":
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0 text-[10px]">Bora</Badge>;
    case "Foquinha AI":
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 text-[10px]">Foquinha</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{product}</Badge>;
  }
};

export const PixRecoveryCard = ({ lead, isSelected, onSelect }: PixRecoveryCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="checkbox-wrapper pt-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {productBadge(lead.product_label)}
              {urgencyBadge(lead.urgency)}
              {lead.exported_at && (
                <Badge variant="outline" className="text-[10px] border-green-300 text-green-600">exportado</Badge>
              )}
            </div>
            <span className="text-sm font-semibold whitespace-nowrap">
              R$ {(lead.amount_cents / 100).toFixed(2)}
            </span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="break-all">{lead.email || "—"}</span>
            </div>
            {lead.name && (
              <p className="text-xs text-foreground font-medium">{lead.name}</p>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
