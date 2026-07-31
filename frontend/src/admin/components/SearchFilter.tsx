import { Search } from "lucide-react";

export function SearchInput({ value, onChange, placeholder = "Buscar…" }: { value: string; onChange(value: string): void; placeholder?: string }) {
  return <label className="ksa-search"><Search size={17} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

export function FilterChips({ values, selected, onChange }: { values: string[]; selected: string; onChange(value: string): void }) {
  return <div className="ksa-chips">{["Todos", ...values].map((value) => <button key={value} className={`ksa-chip ${selected === value ? "is-active" : ""}`} onClick={() => onChange(value)}>{value}</button>)}</div>;
}
