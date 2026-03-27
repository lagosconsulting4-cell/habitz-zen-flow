import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Search, X, Bell, Send, User, Radio } from "lucide-react";
import { toast } from "sonner";

interface UserResult {
  user_id: string;
  display_name: string;
  email: string;
  is_premium: boolean;
}

const AdminPushNotification = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("Novidades no Bora");
  const [broadcastMessage, setBroadcastMessage] = useState("Melhoramos a experiência do app para você — nova sessão de hábitos, visual mais limpo e mais. Abra e confira!");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number; total: number; userCount: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchUsers = async (term: string) => {
    if (term.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const { data, error } = await supabase.rpc("admin_find_user", {
        search_term: term.trim(),
      });
      if (error) {
        console.error("Search error:", error);
        toast.error("Erro ao buscar usuário");
        return;
      }
      setSearchResults((data as UserResult[]) || []);
      setShowDropdown(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedUser(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(value), 300);
  };

  const handleSelectUser = (user: UserResult) => {
    setSelectedUser(user);
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setSearchTerm("");
  };

  const handleSend = async () => {
    if (!selectedUser) {
      toast.error("Selecione um usuário");
      return;
    }
    if (!title.trim()) {
      toast.error("Preencha o título");
      return;
    }
    if (!message.trim()) {
      toast.error("Preencha a mensagem");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-push-notification", {
        body: {
          userId: selectedUser.user_id,
          title: title.trim(),
          body: message.trim(),
          tag: "admin-push",
          data: { url: "/app/" },
        },
      });

      if (error) {
        toast.error(`Erro ao enviar: ${error.message}`);
        return;
      }

      const result = data as { sent: number; failed: number; total: number };

      if (result.sent === 0) {
        toast.warning(
          `Enviado, mas nenhuma subscription ativa encontrada para ${selectedUser.display_name}. O app pode não estar instalado ou o push pode ter sido negado.`
        );
      } else {
        toast.success(
          `Push enviado com sucesso para ${selectedUser.display_name}! (${result.sent}/${result.total} dispositivos)`
        );
        // Clear form
        setTitle("");
        setMessage("");
        setSelectedUser(null);
      }
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    const confirmed = window.confirm(
      `Enviar push para TODOS os usuários com subscription ativa?\n\nTítulo: ${broadcastTitle}\nMensagem: ${broadcastMessage}`
    );
    if (!confirmed) return;

    setBroadcastSending(true);
    setBroadcastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("broadcast-push", {
        body: {
          title: broadcastTitle.trim(),
          body: broadcastMessage.trim(),
          tag: "bora-broadcast",
          data: { url: "/app/" },
        },
      });
      if (error) {
        toast.error(`Erro: ${error.message}`);
        return;
      }
      const result = data as { sent: number; failed: number; total: number; userCount: number };
      setBroadcastResult(result);
      toast.success(`Broadcast enviado! ${result.sent} enviados, ${result.failed} falharam.`);
    } finally {
      setBroadcastSending(false);
    }
  };

  const canSend = !!selectedUser && title.trim().length > 0 && message.trim().length > 0;

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Enviar Push Notification</h1>
        <p className="text-muted-foreground">Envie uma notificação manual para um usuário específico</p>
      </div>

      <Card className="p-6 space-y-5">
        {/* User Search */}
        <div className="space-y-2">
          <Label>Usuário</Label>

          {selectedUser ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedUser.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
              </div>
              {selectedUser.is_premium && (
                <Badge variant="secondary" className="text-xs shrink-0">Premium</Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleClearUser}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar por e-mail, nome ou UUID..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                />
              </div>

              {showDropdown && (
                <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md">
                  {searching ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">Buscando...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">Nenhum usuário encontrado</div>
                  ) : (
                    <ul>
                      {searchResults.map((user) => (
                        <li
                          key={user.user_id}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent cursor-pointer"
                          onMouseDown={() => handleSelectUser(user)}
                        >
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.display_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          {user.is_premium && (
                            <Badge variant="secondary" className="text-xs shrink-0">Premium</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="push-title">Título</Label>
          <Input
            id="push-title"
            placeholder="Ex: Seus streaks estão de volta! 🔥"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="push-body">Mensagem</Label>
          <Textarea
            id="push-body"
            placeholder="Ex: Beber 2L de Água e Academia estão com streak 5. Continue assim!"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground text-right">{message.length}/300</p>
        </div>

        {/* Preview */}
        {(title || message) && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Preview</span>
            </div>
            {title && <p className="text-sm font-semibold">{title}</p>}
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        )}

        {/* Send Button */}
        <Button
          className="w-full gap-2"
          onClick={handleSend}
          disabled={!canSend || sending}
        >
          <Send className="h-4 w-4" />
          {sending ? "Enviando..." : "Enviar Push"}
        </Button>
      </Card>

      {/* Broadcast Card */}
      <Card className="p-6 space-y-5 border-amber-500/30">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-500" />
            Broadcast — Todos os usuários
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Envia para todos com push ativo. Use com moderação.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bc-title">Título</Label>
          <Input
            id="bc-title"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground text-right">{broadcastTitle.length}/100</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bc-body">Mensagem</Label>
          <Textarea
            id="bc-body"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground text-right">{broadcastMessage.length}/300</p>
        </div>

        {(broadcastTitle || broadcastMessage) && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Preview</span>
            </div>
            {broadcastTitle && <p className="text-sm font-semibold">{broadcastTitle}</p>}
            {broadcastMessage && <p className="text-sm text-muted-foreground">{broadcastMessage}</p>}
          </div>
        )}

        {broadcastResult && (
          <div className="rounded-lg border bg-muted/20 p-4 text-sm space-y-1">
            <p className="font-medium">Resultado do último broadcast</p>
            <p className="text-muted-foreground">
              Usuários com subscription: <span className="text-foreground font-medium">{broadcastResult.userCount}</span>
            </p>
            <p className="text-muted-foreground">
              Enviados: <span className="text-green-600 font-medium">{broadcastResult.sent}</span>
              {" · "}
              Falharam: <span className="text-red-500 font-medium">{broadcastResult.failed}</span>
              {" · "}
              Total: <span className="text-foreground font-medium">{broadcastResult.total}</span>
            </p>
          </div>
        )}

        <Button
          className="w-full gap-2 border-amber-500/50 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700"
          variant="outline"
          onClick={handleBroadcast}
          disabled={broadcastSending || !broadcastTitle.trim() || !broadcastMessage.trim()}
        >
          <Radio className="h-4 w-4" />
          {broadcastSending ? "Enviando broadcast..." : "Enviar Broadcast"}
        </Button>
      </Card>
    </div>
  );
};

export default AdminPushNotification;
