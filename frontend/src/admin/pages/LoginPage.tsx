import { ArrowRight, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAdminAuth } from "../auth/AdminAuthContext";
import { AdminButton, Field, TextInput } from "../components/Primitives";
import { StarDecor } from "../components/StarDecor";

export function LoginPage() {
  const { login, devLogin, devLoginAvailable, serverUnavailable, retry } = useAdminAuth();
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

  const enterDevelopment = async () => {
    setSubmitting(true);
    setError("");
    try {
      await devLogin();
      navigate(destination, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Acesso local indisponível.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="ksa-login">
      <StarDecor />
      <section className="ksa-login-panel">
        <a className="ksa-login-brand" href="/" target="_blank" rel="noreferrer"><span>＋</span> Karina Sarte</a>
        <div className="ksa-login-copy">
          <span className="ksa-eyebrow">Central de edição</span>
          <h1>Cuide do seu site com a mesma intenção da sua arte.</h1>
          <p>Edite textos, trabalhos, flashes e produtos em um espaço simples e protegido.</p>
        </div>
      </section>
      <section className="ksa-login-form-wrap">
        <form className="ksa-login-form" onSubmit={submit}>
          <header><span className="ksa-eyebrow">Acesso restrito</span><h2>Bem-vinda de volta</h2><p>Entre com os dados administrativos.</p></header>
          {serverUnavailable && <div className="ksa-alert"><span>Não foi possível falar com o servidor.</span><button type="button" onClick={() => void retry()}><RefreshCw size={15} />Tentar novamente</button></div>}
          <Field label="E-mail"><TextInput type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" required /></Field>
          <Field label="Senha"><div className="ksa-password-field"><TextInput type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={200} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
          {error && <p className="ksa-form-error" role="alert">{error}</p>}
          <AdminButton className="ksa-login-submit" disabled={submitting}>{submitting ? "Entrando…" : <>Entrar <ArrowRight size={17} /></>}</AdminButton>
          {import.meta.env.DEV && devLoginAvailable && <button className="ksa-local-access" type="button" disabled={submitting} onClick={() => void enterDevelopment()}>Login de desenvolvimento</button>}
          <small>Seu acesso é protegido por cookie seguro. A senha nunca fica salva no navegador.</small>
        </form>
      </section>
    </main>
  );
}
