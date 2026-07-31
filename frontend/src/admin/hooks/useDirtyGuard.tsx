import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type DirtyContextValue = {
  dirty: boolean;
  setDirty(value: boolean): void;
  confirmLeave(): boolean;
};

const DirtyContext = createContext<DirtyContextValue | null>(null);

export function DirtyGuardProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  const confirmLeave = useCallback(() => {
    if (!dirty || window.confirm("Você tem alterações não salvas. Deseja sair mesmo assim?")) {
      setDirty(false);
      return true;
    }
    return false;
  }, [dirty]);

  const value = useMemo(() => ({ dirty, setDirty, confirmLeave }), [dirty, confirmLeave]);
  return <DirtyContext.Provider value={value}>{children}</DirtyContext.Provider>;
}

export function useDirtyGuard() {
  const context = useContext(DirtyContext);
  if (!context) throw new Error("useDirtyGuard precisa estar dentro de DirtyGuardProvider.");
  return context;
}
