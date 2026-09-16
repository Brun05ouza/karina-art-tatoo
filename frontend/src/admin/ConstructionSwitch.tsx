import { useEffect, useState } from "react";
import { ApiError, getAdminSettings, patchAdminSettings } from "./auth/api";

export function useConstructionMode() {
  const [on, setOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminSettings()
      .then((settings) => {
        if (active) setOn(settings.developmentMode);
      })
      .catch(() => {
        if (active) setOn(null);
      });
    function onChange(event: Event) {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") setOn(detail);
    }
    window.addEventListener("ks-construction-mode", onChange);
    return () => {
      active = false;
      window.removeEventListener("ks-construction-mode", onChange);
    };
  }, []);

  async function setMode(next: boolean) {
    if (busy || on === null || next === on) return false;
    if (next) {
      const ok = window.confirm(
        "Ligar o aviso tira o restante do site do ar. A página de links continua no ar. Continuar?",
      );
      if (!ok) return false;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await patchAdminSettings({ developmentMode: next });
      setOn(res.developmentMode);
      window.dispatchEvent(new CustomEvent("ks-construction-mode", { detail: res.developmentMode }));
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível atualizar o aviso.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { on, busy, error, setMode };
}

export function ConstructionSwitch({ labelledBy }: { labelledBy?: string }) {
  const { on, busy, error, setMode } = useConstructionMode();
  const checked = on === true;

  return (
    <div className="ks-construction-switch-wrap">
      <button
        type="button"
        className={`ks-construction-switch${checked ? " is-on" : ""}`}
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : checked ? "Site em construção, ligado" : "Site em construção, desligado"}
        disabled={busy || on === null}
        onClick={() => void setMode(!checked)}
      >
        <span className="ks-construction-switch-knob" aria-hidden="true" />
        <span className="ks-construction-switch-label">{busy ? "Salvando…" : checked ? "Ligado" : "Desligado"}</span>
      </button>
      {error ? <p className="ks-construction-switch-error">{error}</p> : null}
    </div>
  );
}
