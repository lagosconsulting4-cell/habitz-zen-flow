import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { LeadStatusBadge } from "./LeadStatusBadge";
import {
  MessageSquare,
  Phone,
  Mail,
  Tag as TagIcon,
  X,
  ExternalLink,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadDetailSheet = ({ lead, open, onOpenChange }: LeadDetailSheetProps) => {
  const [newTag, setNewTag] = useState("");
  const [newNote, setNewNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const {
    updateStatus,
    isUpdatingStatus,
    addNote,
    isAddingNote,
    addTag,
    isAddingTag,
    removeTag,
    isRemovingTag,
    addInteraction,
    useLeadInteractions,
  } = useLeads();

  const interactions = useLeadInteractions(lead?.id || "");

  if (!lead) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus(
        { leadId: lead.id, status: newStatus },
        {
          onSuccess: () => {
            toast.success("Status atualizado com sucesso");
            setSelectedStatus("");
          },
          onError: () => {
            toast.error("Erro ao atualizar status");
          },
        }
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await addNote(
        { leadId: lead.id, note: newNote.trim() },
        {
          onSuccess: () => {
            toast.success("Nota adicionada com sucesso");
            setNewNote("");
          },
          onError: () => {
            toast.error("Erro ao adicionar nota");
          },
        }
      );
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      await addTag(
        { leadId: lead.id, tag: newTag.trim() },
        {
          onSuccess: () => {
            toast.success("Tag adicionada com sucesso");
            setNewTag("");
          },
          onError: () => {
            toast.error("Erro ao adicionar tag");
          },
        }
      );
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTag(
        { leadId: lead.id, tag },
        {
          onSuccess: () => {
            toast.success("Tag removida com sucesso");
          },
          onError: () => {
            toast.error("Erro ao remover tag");
          },
        }
      );
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };

  const whatsappLink = `https://wa.me/55${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Olá ${lead.name}, tudo bem? Vi que você completou nosso quiz...`
  )}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{lead.name}</SheetTitle>
          <SheetDescription>
            Lead criado em {format(new Date(lead.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="interactions">Interações</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Contact Info */}
              <Card className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">Informações de Contato</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${lead.email}`} className="text-blue-500 hover:underline">
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => window.open(whatsappLink, "_blank")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Abrir no WhatsApp
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </Card>

              {/* Status & Tags */}
              <Card className="p-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <LeadStatusBadge status={lead.follow_up_status} />
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) => {
                        setSelectedStatus(value);
                        handleStatusChange(value);
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Alterar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="contactado">Contactado</SelectItem>
                        <SelectItem value="convertido">Convertido</SelectItem>
                        <SelectItem value="perdido">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-semibold">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {lead.tags && lead.tags.length > 0 ? (
                      lead.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            disabled={isRemovingTag}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma tag</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Nova tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      disabled={isAddingTag}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddTag}
                      disabled={isAddingTag || !newTag.trim()}
                    >
                      <TagIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Demographics */}
              <Card className="p-4 space-y-2">
                <h3 className="font-semibold text-sm">Demografia</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Idade:</span>{" "}
                    <span>{lead.age_range || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gênero:</span>{" "}
                    <span className="capitalize">{lead.gender || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profissão:</span>{" "}
                    <span className="capitalize">{lead.profession || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Renda:</span>{" "}
                    <span>{lead.financial_range || "-"}</span>
                  </div>
                </div>
              </Card>

              {/* Quiz Info */}
              <Card className="p-4 space-y-2">
                <h3 className="font-semibold text-sm">Informações do Quiz</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Objetivo:</span>{" "}
                    <span className="capitalize">{lead.objective || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tempo Disponível:</span>{" "}
                    <span>{lead.time_available || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Horário de Trabalho:</span>{" "}
                    <span className="capitalize">{lead.work_schedule || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pico de Energia:</span>{" "}
                    <span className="capitalize">{lead.energy_peak || "-"}</span>
                  </div>
                </div>
              </Card>

              {/* UTM */}
              {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
                <Card className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Origem (UTM)</h3>
                  <div className="space-y-1 text-sm">
                    {lead.utm_source && (
                      <div>
                        <span className="text-muted-foreground">Source:</span>{" "}
                        <Badge variant="outline">{lead.utm_source}</Badge>
                      </div>
                    )}
                    {lead.utm_medium && (
                      <div>
                        <span className="text-muted-foreground">Medium:</span>{" "}
                        <Badge variant="outline">{lead.utm_medium}</Badge>
                      </div>
                    )}
                    {lead.utm_campaign && (
                      <div>
                        <span className="text-muted-foreground">Campaign:</span>{" "}
                        <Badge variant="outline">{lead.utm_campaign}</Badge>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Interactions Tab */}
            <TabsContent value="interactions" className="space-y-4 mt-6">
              <div className="space-y-4">
                {interactions.isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Carregando interações...
                  </p>
                ) : interactions.data && interactions.data.length > 0 ? (
                  interactions.data.map((interaction) => (
                    <Card key={interaction.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{interaction.type}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(interaction.created_at), "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                          {interaction.content && (
                            <p className="text-sm">{interaction.content}</p>
                          )}
                          {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {JSON.stringify(interaction.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma interação registrada ainda.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4 mt-6">
              <Card className="p-4">
                <Label className="text-sm font-semibold">Notas Internas</Label>
                <Textarea
                  placeholder="Digite suas notas sobre este lead..."
                  className="mt-2 min-h-[200px]"
                  value={lead.notes || ""}
                  readOnly
                />
              </Card>

              <Card className="p-4">
                <Label className="text-sm font-semibold">Adicionar Nova Nota</Label>
                <Textarea
                  placeholder="Escreva uma nova nota..."
                  className="mt-2 min-h-[100px]"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  disabled={isAddingNote}
                />
                <Button
                  onClick={handleAddNote}
                  disabled={isAddingNote || !newNote.trim()}
                  className="w-full mt-2"
                >
                  Adicionar Nota
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
