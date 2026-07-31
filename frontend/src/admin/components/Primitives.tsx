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

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return <label className="ksa-field"><span className="ksa-label">{label}</span>{children}{hint && <small className="ksa-hint">{hint}</small>}{error && <small className="ksa-error">{error}</small>}</label>;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`ksa-input ${props.className || ""}`} />; }
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`ksa-textarea ${props.className || ""}`} />; }
export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`ksa-select ${props.className || ""}`} />; }

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange(value: boolean): void; label?: string }) {
  return <button type="button" className={`ksa-switch ${checked ? "is-on" : ""}`} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}><span />{label && <b>{label}</b>}</button>;
}

export function AdminButton({ tone = "primary", size = "md", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "ghost" | "danger"; size?: "sm" | "md" }) {
  return <button {...props} className={`ksa-btn ksa-btn--${tone} ${size === "sm" ? "ksa-btn--sm" : ""} ${props.className || ""}`} />;
}

export function StatusBadge({ status = "Rascunho" }: { status?: string }) {
  const slug = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  return <span className={`ksa-badge ksa-badge--${slug}`}>{status}</span>;
}

export function CollapsibleBlock({ title, summary, children, defaultOpen = false }: { title: string; summary?: string; children: ReactNode; defaultOpen?: boolean }) {
  return <details className="ksa-block" open={defaultOpen}><summary className="ksa-block-toggle"><div><strong>{title}</strong>{summary && <span>{summary}</span>}</div><span aria-hidden="true">＋</span></summary><div className="ksa-block-content">{children}</div></details>;
}
