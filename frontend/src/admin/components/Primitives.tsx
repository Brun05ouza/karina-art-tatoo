import { MousePointerClick } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function AdminPage({ eyebrow, title, description, actions, children }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <main className="ksa-page">
      <header className="ksa-page-head">
        <div><span className="ksa-eyebrow">{eyebrow || "Área administrativa"}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>
        {actions && <div className="ksa-page-actions">{actions}</div>}
      </header>
      {children}
    </main>
  );
}

export function AdminCard({ title, description, action, children, className = "" }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`ksa-card ${className}`}>
    {(title || action) && <header className="ksa-card-head"><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{action}</header>}
    <div className="ksa-card-body">{children}</div>
  </section>;
}

export function Field({ label, hint, error, children, className = "" }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return <label className={`ksa-field ${className}`}><span className="ksa-label">{label}</span>{children}{hint && <small className="ksa-hint">{hint}</small>}{error && <small className="ksa-error">{error}</small>}</label>;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`ksa-input ${props.className || ""}`} />; }
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`ksa-textarea ${props.className || ""}`} />; }
export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`ksa-select ${props.className || ""}`} />; }

export function Toggle({ checked, onChange, label, ariaLabel }: { checked: boolean; onChange(value: boolean): void; label?: string; ariaLabel?: string }) {
  return <button type="button" className={`ksa-switch ${checked ? "is-on" : ""}`} role="switch" aria-checked={checked} aria-label={ariaLabel} onClick={() => onChange(!checked)}><span />{label && <b>{label}</b>}</button>;
}

export function AdminButton({ tone = "primary", size = "md", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "ghost" | "danger"; size?: "sm" | "md" }) {
  return <button {...props} className={`ksa-btn ksa-btn--${tone} ${size === "sm" ? "ksa-btn--sm" : ""} ${props.className || ""}`} />;
}

export function StatusBadge({ status = "Rascunho" }: { status?: string }) {
  const slug = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  return <span className={`ksa-badge ksa-badge--${slug}`}>{status}</span>;
}

/**
 * Cartão que junta o texto do botão e o destino dele num único bloco, com
 * nomes em linguagem simples — a cliente edita "o que aparece" e "para onde
 * leva" sem se deparar com dois campos soltos chamados "Botão" e "URL".
 */
export function ButtonLinkCard({
  title,
  hint,
  optional,
  textLabel = "Texto do botão",
  textValue,
  onTextChange,
  linkValue,
  onLinkChange,
  linkHint = "Endereço da página para onde o botão leva, por exemplo /orcamento.",
}: {
  title: string;
  hint?: string;
  optional?: boolean;
  textLabel?: string;
  textValue: string;
  onTextChange(value: string): void;
  linkValue: string;
  onLinkChange(value: string): void;
  linkHint?: string;
}) {
  return (
    <div className="ksa-button-card">
      <div className="ksa-button-card-head">
        <span className="ksa-button-card-icon"><MousePointerClick size={15} /></span>
        <div>
          <strong>{title}{optional && <em>opcional</em>}</strong>
          {hint && <p>{hint}</p>}
        </div>
      </div>
      <div className="ksa-button-card-fields">
        <Field label={textLabel}><TextInput value={textValue} onChange={(event) => onTextChange(event.target.value)} /></Field>
        <Field label="Para onde ele leva" hint={linkHint}><TextInput value={linkValue} onChange={(event) => onLinkChange(event.target.value)} /></Field>
      </div>
    </div>
  );
}

/**
 * Escolha entre 2–3 opções como cartões clicáveis, cada um com uma frase
 * explicando a consequência — substitui um <select> com valores técnicos
 * (ex.: "automatico"/"manual") por algo que se lê como uma decisão.
 */
export function OptionCards<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange(next: T): void;
  options: { value: T; label: string; description: string }[];
}) {
  return (
    <div className="ksa-option-cards" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={`ksa-option-card ${value === option.value ? "is-selected" : ""}`}
          onClick={() => onChange(option.value)}
        >
          <span className="ksa-option-card-dot" aria-hidden="true" />
          <span>
            <strong>{option.label}</strong>
            <p>{option.description}</p>
          </span>
        </button>
      ))}
    </div>
  );
}

export function CollapsibleBlock({ title, summary, children, defaultOpen = false }: { title: string; summary?: string; children: ReactNode; defaultOpen?: boolean }) {
  return <details className="ksa-block" open={defaultOpen}><summary className="ksa-block-toggle"><div><strong>{title}</strong>{summary && <span>{summary}</span>}</div><span aria-hidden="true">＋</span></summary><div className="ksa-block-content">{children}</div></details>;
}
