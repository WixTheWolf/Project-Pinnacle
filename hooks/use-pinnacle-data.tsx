"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createDefaultState } from "@/lib/seed-data";
import { calculateReadiness, updateStreaks } from "@/lib/readiness";
import { STORAGE_KEYS } from "@/lib/storage/storage-keys";
import { storage } from "@/lib/storage/storage-service";
import { generateId } from "@/lib/utils";
import type {
  DailyTask,
  PackingItem,
  PinnacleState,
  PracticeSession,
  Readiness,
  RecoverySession,
  Round,
} from "@/types";

interface PinnacleContextValue {
  state: PinnacleState;
  readiness: Readiness;
  isHydrated: boolean;
  toggleTask: (taskId: string) => void;
  logPracticeSession: (session: Omit<PracticeSession, "id" | "createdAt">) => void;
  logRecoverySession: (session: Omit<RecoverySession, "id" | "createdAt">) => void;
  logRound: (round: Omit<Round, "id" | "createdAt">) => void;
  togglePackingItem: (itemId: string) => void;
  toggleNutritionItem: (itemId: string) => void;
  resetDailyTasks: () => void;
}

const PinnacleContext = createContext<PinnacleContextValue | null>(null);

function mergeWithDefaults(stored: Partial<PinnacleState> | null): PinnacleState {
  const defaults = createDefaultState();
  if (!stored) return defaults;

  const today = new Date().toISOString().split("T")[0];
  const storedTaskDate = stored.dailyTasks?.[0]?.id?.split("-")[0];
  const dailyTasks =
    storedTaskDate === today ? stored.dailyTasks ?? defaults.dailyTasks : defaults.dailyTasks;

  return {
    ...defaults,
    ...stored,
    user: { ...defaults.user, ...stored.user },
    tournament: { ...defaults.tournament, ...stored.tournament },
    settings: { ...defaults.settings, ...stored.settings },
    dailyTasks,
    streaks: stored.streaks ?? defaults.streaks,
    practiceSessions: stored.practiceSessions ?? [],
    recoverySessions: stored.recoverySessions ?? [],
    rounds: stored.rounds ?? [],
    readinessHistory: stored.readinessHistory ?? [],
  };
}

function persistState(state: PinnacleState): PinnacleState {
  const updated = updateStreaks({
    ...state,
    lastSyncedAt: new Date().toISOString(),
  });
  storage.set(STORAGE_KEYS.PINNACLE_STATE, updated);
  return updated;
}

function getInitialState(): PinnacleState {
  if (typeof window === "undefined") return createDefaultState();
  const stored = storage.get<Partial<PinnacleState>>(STORAGE_KEYS.PINNACLE_STATE);
  return mergeWithDefaults(stored);
}

function subscribeNoop() {
  return () => {};
}

export function PinnacleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PinnacleState>(getInitialState);
  const isHydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const updateState = useCallback((updater: (prev: PinnacleState) => PinnacleState) => {
    setState((prev) => {
      const next = persistState(updater(prev));
      return next;
    });
  }, []);

  const toggleTask = useCallback(
    (taskId: string) => {
      updateState((prev) => ({
        ...prev,
        dailyTasks: prev.dailyTasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      }));
    },
    [updateState]
  );

  const logPracticeSession = useCallback(
    (session: Omit<PracticeSession, "id" | "createdAt">) => {
      const newSession: PracticeSession = {
        ...session,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      updateState((prev) => ({
        ...prev,
        practiceSessions: [newSession, ...prev.practiceSessions],
      }));
    },
    [updateState]
  );

  const logRecoverySession = useCallback(
    (session: Omit<RecoverySession, "id" | "createdAt">) => {
      const newSession: RecoverySession = {
        ...session,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      updateState((prev) => ({
        ...prev,
        recoverySessions: [newSession, ...prev.recoverySessions],
      }));
    },
    [updateState]
  );

  const logRound = useCallback(
    (round: Omit<Round, "id" | "createdAt">) => {
      const newRound: Round = {
        ...round,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      updateState((prev) => ({
        ...prev,
        rounds: [newRound, ...prev.rounds],
      }));
    },
    [updateState]
  );

  const togglePackingItem = useCallback(
    (itemId: string) => {
      updateState((prev) => ({
        ...prev,
        tournament: {
          ...prev.tournament,
          packingList: prev.tournament.packingList.map((item: PackingItem) =>
            item.id === itemId ? { ...item, packed: !item.packed } : item
          ),
        },
      }));
    },
    [updateState]
  );

  const toggleNutritionItem = useCallback(
    (itemId: string) => {
      updateState((prev) => ({
        ...prev,
        tournament: {
          ...prev.tournament,
          nutritionPlan: prev.tournament.nutritionPlan.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        },
      }));
    },
    [updateState]
  );

  const resetDailyTasks = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      dailyTasks: createDefaultState().dailyTasks,
    }));
  }, [updateState]);

  const readiness = useMemo(() => calculateReadiness(state), [state]);

  const value = useMemo(
    () => ({
      state,
      readiness,
      isHydrated,
      toggleTask,
      logPracticeSession,
      logRecoverySession,
      logRound,
      togglePackingItem,
      toggleNutritionItem,
      resetDailyTasks,
    }),
    [
      state,
      readiness,
      isHydrated,
      toggleTask,
      logPracticeSession,
      logRecoverySession,
      logRound,
      togglePackingItem,
      toggleNutritionItem,
      resetDailyTasks,
    ]
  );

  return <PinnacleContext.Provider value={value}>{children}</PinnacleContext.Provider>;
}

export function usePinnacle(): PinnacleContextValue {
  const context = useContext(PinnacleContext);
  if (!context) {
    throw new Error("usePinnacle must be used within PinnacleProvider");
  }
  return context;
}

export function useDailyTasks(): DailyTask[] {
  const { state } = usePinnacle();
  return state.dailyTasks;
}

export function useReadiness(): Readiness {
  const { readiness } = usePinnacle();
  return readiness;
}

export function usePracticeHistory(): PracticeSession[] {
  const { state } = usePinnacle();
  return state.practiceSessions;
}

export function useRecoveryHistory(): RecoverySession[] {
  const { state } = usePinnacle();
  return state.recoverySessions;
}

export function useRounds(): Round[] {
  const { state } = usePinnacle();
  return state.rounds;
}

export function useTournament() {
  const { state } = usePinnacle();
  return state.tournament;
}

export function useStreaks() {
  const { state } = usePinnacle();
  return state.streaks;
}

export function useUser() {
  const { state } = usePinnacle();
  return state.user;
}

export function useSettings() {
  const { state } = usePinnacle();
  return state.settings;
}
