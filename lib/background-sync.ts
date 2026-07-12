/**
 * Background sync - queues actions when offline and replays them when online.
 * Stores the queue in localStorage for persistence across page reloads.
 */

const SYNC_QUEUE_KEY = "background-sync-queue";

export type SyncActionType = "add_favorite" | "remove_favorite" | "add_to_collection" | "remove_from_collection";

export interface SyncAction {
  id: string;
  type: SyncActionType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

type ActionHandler = (action: SyncAction) => Promise<void>;

const handlers = new Map<SyncActionType, ActionHandler>();
let isProcessing = false;
let isListening = false;

/**
 * Register a handler for a specific action type.
 * The handler will be called when the action is replayed.
 */
export function registerSyncHandler(
  type: SyncActionType,
  handler: ActionHandler
): void {
  handlers.set(type, handler);
}

/**
 * Get the current sync queue from localStorage.
 */
function getQueue(): SyncAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save the sync queue to localStorage.
 */
function saveQueue(queue: SyncAction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Silently handle quota exceeded
  }
}

/**
 * Queue an action for background sync.
 * If online, the action is processed immediately.
 * If offline, it is stored and will be replayed when online.
 */
export function queueAction(
  type: SyncActionType,
  payload: Record<string, unknown>
): void {
  const action: SyncAction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };

  if (typeof window !== "undefined" && navigator.onLine) {
    // Try to process immediately
    processAction(action).catch(() => {
      // If it fails, add to queue
      const queue = getQueue();
      queue.push(action);
      saveQueue(queue);
    });
  } else {
    // Offline: add to queue
    const queue = getQueue();
    queue.push(action);
    saveQueue(queue);
  }
}

/**
 * Process a single action by calling its registered handler.
 */
async function processAction(action: SyncAction): Promise<void> {
  const handler = handlers.get(action.type);
  if (!handler) {
    // No handler registered - discard the action
    return;
  }
  await handler(action);
}

/**
 * Process all queued actions in order.
 * Failed actions are re-queued with an incremented retry count.
 */
export async function processQueue(): Promise<void> {
  if (isProcessing) return;
  if (typeof window === "undefined" || !navigator.onLine) return;

  isProcessing = true;
  const queue = getQueue();

  if (queue.length === 0) {
    isProcessing = false;
    return;
  }

  const failedActions: SyncAction[] = [];
  const MAX_RETRIES = 3;

  for (const action of queue) {
    try {
      await processAction(action);
    } catch {
      if (action.retryCount < MAX_RETRIES) {
        failedActions.push({
          ...action,
          retryCount: action.retryCount + 1,
        });
      }
      // Actions exceeding max retries are discarded
    }
  }

  saveQueue(failedActions);
  isProcessing = false;
}

/**
 * Get the number of pending actions in the queue.
 */
export function getPendingCount(): number {
  return getQueue().length;
}

/**
 * Clear all pending actions from the queue.
 */
export function clearQueue(): void {
  saveQueue([]);
}

/**
 * Initialize background sync listeners.
 * Listens for online events to replay queued actions.
 */
export function initBackgroundSync(): void {
  if (typeof window === "undefined" || isListening) return;
  isListening = true;

  window.addEventListener("online", () => {
    processQueue();
  });

  // Process any pending actions on initialization if online
  if (navigator.onLine) {
    processQueue();
  }
}

/**
 * Check if the app is currently online.
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}
