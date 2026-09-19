"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Viewer } from "@/types/domain";

const ANONYMOUS: Viewer = { user: null, rsvpIds: [], hostedIds: [] };

interface ViewerContextValue {
  viewer: Viewer;
  loaded: boolean;
  /** Authoritative RSVP counts returned by the server, overriding the (possibly cached) page value. */
  counts: Readonly<Record<string, number>>;
  refresh: () => Promise<void>;
  applyRsvp: (eventId: string, going: boolean, count: number) => void;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [viewer, setViewer] = useState<Viewer>(ANONYMOUS);
  const [loaded, setLoaded] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/viewer", { cache: "no-store" });
      setViewer(res.ok ? ((await res.json()) as Viewer) : ANONYMOUS);
    } catch {
      /* keep the previous state if offline */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const applyRsvp = useCallback((eventId: string, going: boolean, count: number) => {
    setViewer((v) => ({ ...v, rsvpIds: going ? [...new Set([...v.rsvpIds, eventId])] : v.rsvpIds.filter((id) => id !== eventId) }));
    setCounts((c) => ({ ...c, [eventId]: count }));
  }, []);

  const value = useMemo(() => ({ viewer, loaded, counts, refresh, applyRsvp }), [viewer, loaded, counts, refresh, applyRsvp]);
  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer(): ViewerContextValue {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used inside <ViewerProvider>");
  return ctx;
}
