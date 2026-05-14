"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { ProductivityInsights } from "@/lib/schemas/insights";
import { MOCK_INSIGHTS } from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------

type Status = "idle" | "loading" | "success" | "error";

interface DashboardState {
  insights: ProductivityInsights | null;
  status: Status;
  error: string | null;
  lastRefreshed: Date | null;
}

type DashboardAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: ProductivityInsights }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "RESET" };

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading", error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        status: "success",
        insights: action.payload,
        error: null,
        lastRefreshed: new Date(),
      };
    case "FETCH_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const initialState: DashboardState = {
  insights: null,
  status: "idle",
  error: null,
  lastRefreshed: null,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface DashboardContextValue extends DashboardState {
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const refresh = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      // Simulated fetch delay — replace with real API call when backend is ready
      await new Promise((r) => setTimeout(r, 600));
      dispatch({ type: "FETCH_SUCCESS", payload: MOCK_INSIGHTS });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: err instanceof Error ? err.message : "Failed to load insights",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DashboardContext.Provider value={{ ...state, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}
