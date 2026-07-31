import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { AdminButton, Field, TextArea, TextInput, Toggle } from "./Primitives";

export type RepeaterField = { key: string; label: string; type?: "text" | "textarea" };

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
}: {
  items: T[];
  fields: RepeaterField[];
  onChange(next: T[]): void;
  blank?: () => T;
  addLabel?: string;
  max?: number;
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
    <div className="ksa-stack">
      {sorted.map((item, index) => (
        <article className="ksa-mini-editor" key={item.id}>
          <div className="ksa-mini-editor-order">
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Mover para cima"><ArrowUp size={15} /></button>
            <button type="button" disabled={index === sorted.length - 1} onClick={() => move(index, 1)} aria-label="Mover para baixo"><ArrowDown size={15} /></button>
          </div>

          {fields.map((field) => (
            <Field key={field.key} label={field.label}>
              {field.type === "textarea"
                ? <TextArea rows={3} value={String((item as Record<string, unknown>)[field.key] ?? "")} onChange={(event) => patch(item.id, { [field.key]: event.target.value } as Partial<T>)} />
                : <TextInput value={String((item as Record<string, unknown>)[field.key] ?? "")} onChange={(event) => patch(item.id, { [field.key]: event.target.value } as Partial<T>)} />}
            </Field>
          ))}

          <Toggle checked={item.active} onChange={(active) => patch(item.id, { active } as Partial<T>)} label={item.active ? "Ativo" : "Inativo"} />

          <button type="button" className="ksa-icon-danger" aria-label="Excluir" onClick={() => commit(sorted.filter((current) => current.id !== item.id))}><Trash2 size={16} /></button>
        </article>
      ))}

      {blank && (!max || sorted.length < max) ? (
        <AdminButton tone="ghost" onClick={() => commit([...sorted, blank()])}><Plus size={16} />{addLabel}</AdminButton>
      ) : null}
    </div>
  );
}
