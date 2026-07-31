import { CheckCircle2, XCircle, X } from "lucide-react";
import { useToast } from "../hooks/useToast";

export function ToastHost() {
  const { toasts, dismiss } = useToast();
  return <div className="ksa-toast-host" aria-live="polite">{toasts.map((toast) => <div key={toast.id} className={`ksa-toast ksa-toast--${toast.tone}`}>{toast.tone === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}<span>{toast.message}</span><button onClick={() => dismiss(toast.id)} aria-label="Fechar aviso"><X size={15} /></button></div>)}</div>;
}
