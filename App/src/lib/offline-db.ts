import { openDB, IDBPDatabase } from "idb";

// Tipos para o banco offline
export interface CachedHabit {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  category: string;
  period: string;
  streak: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CachedCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  created_at: string;
}

export interface SyncQueueItem {
  id: string;
  type: "create_habit" | "update_habit" | "delete_habit" | "create_completion" | "delete_completion";
  payload: Record<string, unknown>;
  created_at: string;
  retries: number;
}

export interface OfflineDBSchema {
  habits: {
    key: string;
    value: CachedHabit;
    indexes: { "by-user": string };
  };
  completions: {
    key: string;
    value: CachedCompletion;
    indexes: { "by-user": string; "by-habit": string; "by-date": string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { "by-type": string };
  };
  metadata: {
    key: string;
    value: { key: string; value: string | number | boolean };
  };
}

const DB_NAME = "bora-offline";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<OfflineDBSchema> | null = null;

// Abrir/criar o banco de dados
export async function getOfflineDB(): Promise<IDBPDatabase<OfflineDBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store de hábitos
      if (!db.objectStoreNames.contains("habits")) {
        const habitsStore = db.createObjectStore("habits", { keyPath: "id" });
        habitsStore.createIndex("by-user", "user_id");
      }

      // Store de completions
      if (!db.objectStoreNames.contains("completions")) {
        const completionsStore = db.createObjectStore("completions", { keyPath: "id" });
        completionsStore.createIndex("by-user", "user_id");
        completionsStore.createIndex("by-habit", "habit_id");
        completionsStore.createIndex("by-date", "completed_at");
      }

      // Store de fila de sincronização
      if (!db.objectStoreNames.contains("syncQueue")) {
        const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" });
        syncStore.createIndex("by-type", "type");
      }

      // Store de metadados
      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata", { keyPath: "key" });
      }
    },
  });

  return dbInstance;
}

// ============================================
// HABITS
// ============================================

export async function cacheHabits(habits: CachedHabit[]): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction("habits", "readwrite");

  await Promise.all([
    ...habits.map((habit) => tx.store.put(habit)),
    tx.done,
  ]);

  // Salvar timestamp da última sincronização
  await setMetadata("habits_last_sync", Date.now());
}

export async function getCachedHabits(userId: string): Promise<CachedHabit[]> {
  const db = await getOfflineDB();
  return db.getAllFromIndex("habits", "by-user", userId);
}

export async function getCachedHabit(habitId: string): Promise<CachedHabit | undefined> {
  const db = await getOfflineDB();
  return db.get("habits", habitId);
}

export async function updateCachedHabit(habit: CachedHabit): Promise<void> {
  const db = await getOfflineDB();
  await db.put("habits", habit);
}

export async function deleteCachedHabit(habitId: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete("habits", habitId);
}

// ============================================
// COMPLETIONS
// ============================================

export async function cacheCompletions(completions: CachedCompletion[]): Promise<void> {
  const db = await getOfflineDB();
  const tx = db.transaction("completions", "readwrite");

  await Promise.all([
    ...completions.map((completion) => tx.store.put(completion)),
    tx.done,
  ]);

  await setMetadata("completions_last_sync", Date.now());
}

export async function getCachedCompletions(userId: string): Promise<CachedCompletion[]> {
  const db = await getOfflineDB();
  return db.getAllFromIndex("completions", "by-user", userId);
}

export async function getCachedCompletionsByHabit(habitId: string): Promise<CachedCompletion[]> {
  const db = await getOfflineDB();
  return db.getAllFromIndex("completions", "by-habit", habitId);
}

export async function getCachedCompletionsByDate(date: string): Promise<CachedCompletion[]> {
  const db = await getOfflineDB();
  return db.getAllFromIndex("completions", "by-date", date);
}

export async function addCachedCompletion(completion: CachedCompletion): Promise<void> {
  const db = await getOfflineDB();
  await db.put("completions", completion);
}

export async function deleteCachedCompletion(completionId: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete("completions", completionId);
}

// ============================================
// SYNC QUEUE
// ============================================

export async function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "created_at" | "retries">): Promise<string> {
  const db = await getOfflineDB();
  const id = crypto.randomUUID();

  await db.put("syncQueue", {
    ...item,
    id,
    created_at: new Date().toISOString(),
    retries: 0,
  });

  return id;
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getOfflineDB();
  return db.getAll("syncQueue");
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getOfflineDB();
  await db.delete("syncQueue", id);
}

export async function incrementSyncRetries(id: string): Promise<void> {
  const db = await getOfflineDB();
  const item = await db.get("syncQueue", id);

  if (item) {
    item.retries += 1;
    await db.put("syncQueue", item);
  }
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getOfflineDB();
  await db.clear("syncQueue");
}

// ============================================
// METADATA
// ============================================

export async function setMetadata(key: string, value: string | number | boolean): Promise<void> {
  const db = await getOfflineDB();
  await db.put("metadata", { key, value });
}

export async function getMetadata(key: string): Promise<string | number | boolean | undefined> {
  const db = await getOfflineDB();
  const result = await db.get("metadata", key);
  return result?.value;
}

// ============================================
// UTILITIES
// ============================================

export async function clearAllOfflineData(): Promise<void> {
  const db = await getOfflineDB();

  await Promise.all([
    db.clear("habits"),
    db.clear("completions"),
    db.clear("syncQueue"),
    db.clear("metadata"),
  ]);
}

export async function getLastSyncTimestamp(store: "habits" | "completions"): Promise<number | undefined> {
  const key = `${store}_last_sync`;
  const value = await getMetadata(key);
  return typeof value === "number" ? value : undefined;
}

// Verificar se há itens pendentes na fila de sync
export async function hasPendingSyncItems(): Promise<boolean> {
  const queue = await getSyncQueue();
  return queue.length > 0;
}

// Obter contagem de itens pendentes
export async function getPendingSyncCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}
