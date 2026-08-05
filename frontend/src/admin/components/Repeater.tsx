import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { ImagePicker } from "./ImagePicker";
import { AdminButton, Field, TextArea, TextInput, Toggle } from "./Primitives";

export type RepeaterField = { key: string; label: string; type?: "text" | "textarea" | "image" };

type RepeaterItem = { id: string; active: boolean; order: number };

/**
 * Lista editável de cards: ordem, ativo/inativo, adicionar e excluir.
 *
 * A cliente só mexe em conteúdo — não há campo de cor, fonte ou espaçamento,
 * então não é possível quebrar o layout do site a partir daqui.
 */
export function Repeater<T extends RepeaterItem>({
  items,
  fields,
  onChange,
  blank,
  addLabel = "Adicionar item",
  max,
  compact = false,
  cards = false,
}: {
  items: T[];
  fields: RepeaterField[];
  onChange(next: T[]): void;
  blank?: () => T;
  addLabel?: string;
  max?: number;
  compact?: boolean;
  cards?: boolean;
}) {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  /** Reescreve `order` sequencialmente para não deixar buracos após mover/excluir. */
  const commit = (next: T[]) => onChange(next.map((item, index) => ({ ...item, order: index + 1 })));

  const patch = (id: string, changes: Partial<T>) => commit(sorted.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    const moved = next[index]!;
    next[index] = next[target]!;
    next[target] = moved;
    commit(next);
  };

  return (
    <div className={`ksa-stack ${compact ? "is-compact" : ""} ${cards ? "is-card-list" : ""}`}>
      {sorted.map((item, index) => (
        <article className={`ksa-mini-editor ${compact ? "is-compact" : ""} ${cards ? "is-card" : ""}`} key={item.id}>
          <div className="ksa-mini-editor-order">
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Mover para cima"><ArrowUp size={15} /></button>
            <button type="button" disabled={index === sorted.length - 1} onClick={() => move(index, 1)} aria-label="Mover para baixo"><ArrowDown size={15} /></button>
          </div>

          {fields.map((field) => {
            const current = String((item as Record<string, unknown>)[field.key] ?? "");
            if (field.type === "image") return <div className="ksa-repeater-image" key={field.key}><ImagePicker label={field.label} value={current} onChange={(url) => patch(item.id, { [field.key]: url } as Partial<T>)} /></div>;
            return <Field key={field.key} label={field.label} className={cards ? `ksa-repeater-field--${field.key}` : ""}>
              {field.type === "textarea"
                ? <TextArea aria-label={field.label} rows={3} value={current} onChange={(event) => patch(item.id, { [field.key]: event.target.value } as Partial<T>)} />
                : <TextInput aria-label={field.label} value={current} onChange={(event) => patch(item.id, { [field.key]: event.target.value } as Partial<T>)} />}
            </Field>;
          })}

          <Toggle checked={item.active} onChange={(active) => patch(item.id, { active } as Partial<T>)} label={compact ? undefined : (item.active ? "Ativo" : "Inativo")} ariaLabel={item.active ? "Desativar item" : "Ativar item"} />

          <button type="button" className="ksa-icon-danger" aria-label="Excluir" onClick={() => commit(sorted.filter((current) => current.id !== item.id))}><Trash2 size={16} /></button>
        </article>
      ))}

      {blank && (!max || sorted.length < max) ? (
        <AdminButton tone="ghost" size={compact ? "sm" : "md"} className={compact ? "ksa-repeater-add" : ""} onClick={() => commit([...sorted, blank()])}><Plus size={16} />{addLabel}</AdminButton>
      ) : null}
    </div>
  );
}
