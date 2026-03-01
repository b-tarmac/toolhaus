"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

interface WorkspaceContextValue {
  toolSlug: string;
  initialState: Record<string, unknown> | null;
  currentState: Record<string, unknown>;
  readOnly?: boolean;
  setInitialState: (state: Record<string, unknown> | null) => void;
  reportState: (state: Record<string, unknown>) => void;
}

export type { WorkspaceContextValue };

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  toolSlug,
  children,
  initialWorkspaceState = null,
  readOnly = false,
}: {
  toolSlug: string;
  children: ReactNode;
  initialWorkspaceState?: Record<string, unknown> | null;
  readOnly?: boolean;
}) {
  const [initialState, setInitialState] = useState<Record<string, unknown> | null>(
    initialWorkspaceState ?? null
  );

  useEffect(() => {
    if (initialWorkspaceState) setInitialState(initialWorkspaceState);
  }, [initialWorkspaceState]);
  const [currentState, setCurrentState] = useState<Record<string, unknown>>({});

  const reportState = useCallback((state: Record<string, unknown>) => {
    setCurrentState(state);
  }, []);

  const value: WorkspaceContextValue = {
    toolSlug,
    initialState,
    currentState,
    readOnly,
    setInitialState,
    reportState,
  };

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  return ctx;
}

/**
 * Call from a tool to report its current state for workspace saving.
 * Debounced to avoid excessive updates.
 */
export function useWorkspaceReportState(state: Record<string, unknown>) {
  const ctx = useWorkspace();
  const prevRef = useRef<string>("");

  useEffect(() => {
    if (!ctx) return;
    const key = JSON.stringify(state);
    if (key === prevRef.current) return;
    prevRef.current = key;
    ctx.reportState(state);
  }, [ctx, state]);
}

/**
 * Call from a tool to get and consume initial state when loading a workspace.
 * Returns the state and clears it so it's only applied once.
 */
export function useWorkspaceInitialState(): Record<string, unknown> | null {
  const ctx = useWorkspace();
  const [consumed, setConsumed] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!ctx?.initialState) return;
    setConsumed(ctx.initialState);
    ctx.setInitialState(null);
  }, [ctx?.initialState]);

  return consumed;
}
