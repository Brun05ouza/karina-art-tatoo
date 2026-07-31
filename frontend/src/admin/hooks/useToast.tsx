import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Toast = { id: string; message: string; tone: "success" | "error" };
type ToastContextValue = { toasts: Toast[]; show(message: string, tone?: Toast["tone"]): void; dismiss(id: string): void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const show = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, tone }]);
    window.setTimeout(() => dismiss(id), 3800);
  }, [dismiss]);
  const value = useMemo(() => ({ toasts, show, dismiss }), [toasts, show, dismiss]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast precisa estar dentro de ToastProvider.");
  return context;
}
