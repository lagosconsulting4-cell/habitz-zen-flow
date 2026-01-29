import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Target, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead } from "@/hooks/useLeads";

interface LeadCardProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
}

export const LeadCard = ({ lead, isSelected, onSelect, onClick }: LeadCardProps) => {
  return (
    <Card
      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.checkbox-wrapper')) return;
        onClick();
      }}
    >
      <div className="flex items-start gap-3">
        <div className="checkbox-wrapper pt-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm">{lead.name}</h3>
            <LeadStatusBadge status={lead.follow_up_status} />
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span className="break-all">{lead.email}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.objective && (
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3" />
                <span className="truncate">{lead.objective}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
              {lead.source && (
                <Badge variant="outline" className="text-xs flex-shrink-0">{lead.source}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
