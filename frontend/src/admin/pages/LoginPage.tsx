import { ArrowRight, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAdminAuth } from "../auth/AdminAuthContext";
import { AdminButton, Field, TextInput } from "../components/Primitives";

export function LoginPage() {
  const { login, serverUnavailable, retry } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const destination = typeof location.state?.from === "string" && location.state.from.startsWith("/admin")
    ? location.state.from
    : "/admin";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível entrar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="ksa-login">
      <div className="ksa-login-section-stars" aria-hidden="true">
        <img className="star-1" src="/assets/brand/star-karina-filled.png" alt="" />
        <img className="star-2" src="/assets/brand/star-karina-outline.png" alt="" />
        <img className="star-3" src="/assets/brand/star-karina-filled.png" alt="" />
        <img className="star-4" src="/assets/brand/star-karina-outline.png" alt="" />
        <img className="star-5" src="/assets/brand/star-karina-filled.png" alt="" />
      </div>
      <section className="ksa-login-panel">
        <img className="ksa-login-panel-bg" src="/assets/hero.jpeg" alt="" aria-hidden="true" />
        <a className="ksa-login-brand" href="/" target="_blank" rel="noreferrer"><span>＋</span> Karina Sarte</a>
        <div className="ksa-login-copy">
          <span className="ksa-eyebrow">Central de edição</span>
          <h1>Seu universo Sarte, protegido e pronto para editar.</h1>
          <p>Atualize textos, trabalhos, flashes e coleções em um espaço com a mesma identidade do site real.</p>
        </div>
      </section>
      <section className="ksa-login-form-wrap">
        <form className="ksa-login-form" onSubmit={submit}>
          <header>
            <span className="ksa-eyebrow">Acesso restrito</span>
            <h2>Bem-vinda de volta</h2>
            <p>Entre com o usuário administrativo autorizado.</p>
          </header>
          {serverUnavailable && (
            <div className="ksa-alert">
              <span>Não foi possível falar com o servidor.</span>
              <button type="button" onClick={() => void retry()}><RefreshCw size={15} />Tentar novamente</button>
            </div>
          )}
          <Field label="E-mail">
            <TextInput type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" required />
          </Field>
          <Field label="Senha">
            <div className="ksa-password-field">
              <TextInput type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={200} />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          {error && <p className="ksa-form-error" role="alert">{error}</p>}
          <AdminButton className="ksa-login-submit" disabled={submitting}>{submitting ? "Entrando…" : <>Entrar <ArrowRight size={17} /></>}</AdminButton>
          <small>Entre com calma — seu cantinho de edição está te esperando.</small>
        </form>
      </section>
    </main>
  );
}
