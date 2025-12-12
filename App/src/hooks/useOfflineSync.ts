import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsOnline } from "./useOnlineStatus";
import {
  getSyncQueue,
  removeSyncQueueItem,
  incrementSyncRetries,
  SyncQueueItem,
} from "@/lib/offline-db";
import { toast } from "sonner";

const MAX_RETRIES = 3;
const SYNC_INTERVAL = 10000; // 10 segundos

export function useOfflineSync() {
  const isOnline = useIsOnline();
  const queryClient = useQueryClient();
  const isSyncing = useRef(false);

  // Processar um item da fila
  const processQueueItem = useCallback(
    async (item: SyncQueueItem): Promise<boolean> => {
      try {
        switch (item.type) {
          case "create_habit": {
            const { data, error } = await supabase
              .from("habits")
              .insert(item.payload as Record<string, unknown>)
              .select()
              .single();

            if (error) throw error;
            console.log("[Sync] Hábito criado:", data?.id);
            break;
          }

          case "update_habit": {
            const { id, ...updates } = item.payload as { id: string; [key: string]: unknown };
            const { error } = await supabase
              .from("habits")
              .update(updates)
              .eq("id", id);

            if (error) throw error;
            console.log("[Sync] Hábito atualizado:", id);
            break;
          }

          case "delete_habit": {
            const { id } = item.payload as { id: string };
            const { error, count } = await supabase.from("habits").delete().eq("id", id).select();

            if (error) throw error;
            if (!count || count === 0) {
              console.warn("[Sync] Nenhum hábito foi deletado (possível problema de permissão):", id);
            } else {
              console.log("[Sync] Hábito deletado:", id);
            }
            break;
          }

          case "create_completion": {
            const { data, error } = await supabase
              .from("habit_completions")
              .insert(item.payload as Record<string, unknown>)
              .select()
              .single();

            if (error) throw error;
            console.log("[Sync] Completion criada:", data?.id);
            break;
          }

          case "delete_completion": {
            const { id } = item.payload as { id: string };
            const { error } = await supabase
              .from("habit_completions")
              .delete()
              .eq("id", id);

            if (error) throw error;
            console.log("[Sync] Completion deletada:", id);
            break;
          }

          default:
            console.warn("[Sync] Tipo de operação desconhecido:", item.type);
            return false;
        }

        return true;
      } catch (error) {
        console.error("[Sync] Erro ao processar item:", error);
        return false;
      }
    },
    []
  );

  // Processar toda a fila
  const processQueue = useCallback(async () => {
    if (isSyncing.current || !isOnline) return;

    isSyncing.current = true;
    let processedCount = 0;
    let failedCount = 0;

    try {
      const queue = await getSyncQueue();

      if (queue.length === 0) {
        isSyncing.current = false;
        return;
      }

      console.log(`[Sync] Processando ${queue.length} itens na fila`);

      for (const item of queue) {
        // Verificar se ainda estamos online
        if (!navigator.onLine) {
          console.log("[Sync] Conexão perdida, pausando sincronização");
          break;
        }

        // Pular itens com muitas tentativas
        if (item.retries >= MAX_RETRIES) {
          console.warn("[Sync] Item excedeu máximo de tentativas:", item.id);
          await removeSyncQueueItem(item.id);
          failedCount++;
          continue;
        }

        const success = await processQueueItem(item);

        if (success) {
          await removeSyncQueueItem(item.id);
          processedCount++;
        } else {
          await incrementSyncRetries(item.id);
          failedCount++;
        }
      }

      // Invalidar queries para atualizar a UI
      if (processedCount > 0) {
        await queryClient.invalidateQueries({ queryKey: ["habits"] });
        await queryClient.invalidateQueries({ queryKey: ["completions"] });
      }

      // Notificar usuário
      if (processedCount > 0 || failedCount > 0) {
        if (failedCount === 0) {
          toast.success(`${processedCount} alteração${processedCount !== 1 ? "ões" : ""} sincronizada${processedCount !== 1 ? "s" : ""}`);
        } else {
          toast.warning(
            `Sincronizado: ${processedCount}, Falhas: ${failedCount}`,
            { description: "Algumas alterações serão tentadas novamente" }
          );
        }
      }
    } catch (error) {
      console.error("[Sync] Erro ao processar fila:", error);
    } finally {
      isSyncing.current = false;
    }
  }, [isOnline, processQueueItem, queryClient]);

  // Sincronizar quando voltar online
  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  // Sincronização periódica quando online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(processQueue, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [isOnline, processQueue]);

  // Sincronizar ao montar (ex: ao abrir o app)
  useEffect(() => {
    if (isOnline) {
      // Pequeno delay para garantir que tudo está carregado
      const timeout = setTimeout(processQueue, 2000);
      return () => clearTimeout(timeout);
    }
  }, []);

  return {
    processQueue,
    isSyncing: isSyncing.current,
  };
}
