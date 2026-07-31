import { AlertCircle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { StarGlyph8 } from "../../app/components/StarGlyph";
import { AdminButton } from "./Primitives";

export function LoadingState({ label = "Carregando conteúdo…" }: { label?: string }) {
  return <div className="ksa-state"><div className="ksa-skeleton" /><div className="ksa-skeleton is-short" /><span>{label}</span></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry(): void }) {
  return <div className="ksa-state ksa-state--error"><AlertCircle size={28} /><strong>Algo não saiu como esperado</strong><p>{message}</p><AdminButton tone="ghost" onClick={onRetry}><RefreshCw size={16} />Tentar novamente</AdminButton></div>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="ksa-empty"><StarGlyph8 size={34} color="#806e85" /><strong>{title}</strong><p>{text}</p>{action}</div>;
}

export function ConfirmDialog({ open, title, text, onConfirm, onCancel }: { open: boolean; title: string; text: string; onConfirm(): void; onCancel(): void }) {
  if (!open) return null;
  return <div className="ksa-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}><div className="ksa-modal" role="alertdialog" aria-modal="true" aria-labelledby="ksa-confirm-title"><h2 id="ksa-confirm-title">{title}</h2><p>{text}</p><div className="ksa-modal-actions"><AdminButton tone="ghost" onClick={onCancel}>Cancelar</AdminButton><AdminButton tone="danger" onClick={onConfirm}>Excluir</AdminButton></div></div></div>;
}
