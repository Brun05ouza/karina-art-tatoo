import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { StencilCrosshair } from "./StencilCrosshair";

type Step = 0 | 1 | 2;

const stepLabels = ["CONTATO", "DISPONIBILIDADE", "IDEIA"];

const availability = ["este mês", "próximo mês", "flexível", "data específica"];

function FloatInput({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div style={{ position: "relative", paddingTop: 20, marginBottom: 28 }}>
      <label
        style={{
          position: "absolute",
          top: active ? 0 : 28,
          left: 0,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: active ? 8 : 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: active ? (focused ? "#263C86" : "#e9c082") : "#949087",
          transition: "all 0.25s ease",
          pointerEvents: "none",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `0.5px solid ${focused ? "#263C86" : "rgba(242,237,226,0.2)"}`,
          outline: "none",
          fontFamily: '"Hanken Grotesk", sans-serif',
          fontSize: 15,
          fontWeight: 300,
          color: "#F2EDE2",
          padding: "8px 0",
          transition: "border-color 0.3s ease",
          cursor: "inherit",
        }}
      />
    </div>
  );
}

export function BookingForm() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const ease = [0.22, 1, 0.36, 1];

  const [step, setStep] = useState<Step>(0);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    availability: "",
    availDetails: "",
    idea: "",
  });

  const setField = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const next = () => setStep((s) => Math.min(s + 1, 2) as Step);
  const back = () => setStep((s) => Math.max(s - 1, 0) as Step);
  const submit = () => setSent(true);

  return (
    <section
      id="agendar"
      style={{
        background: "#0d0e0d",
        padding: "clamp(80px, 12vw, 160px) clamp(24px, 5vw, 64px)",
      }}
    >
      {/* Header */}
      <div ref={ref} style={{ textAlign: "center", marginBottom: "clamp(48px, 7vw, 80px)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease }}
          style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(32px, 4vw, 56px)",
            fontWeight: 400,
            color: "#F2EDE2",
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          O Início de uma Ideia
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          style={{
            fontFamily: '"Hanken Grotesk", sans-serif',
            fontSize: 14,
            fontWeight: 300,
            color: "#949087",
            maxWidth: 420,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Compartilhe sua intenção, região do corpo e o que a tatuagem precisa carregar.
        </motion.p>
      </div>

      {/* Form container */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, delay: 0.4, ease }}
        style={{
          maxWidth: 560,
          margin: "0 auto",
          background: "#131412",
          border: "1px solid rgba(242,237,226,0.1)",
          padding: "clamp(24px, 5vw, 56px)",
          position: "relative",
        }}
      >
        <StencilCrosshair size={14} color="#263C86" />

        {/* Step indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40, justifyContent: "center" }}>
          {stepLabels.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: i === step ? "#e9c082" : i < step ? "#e9c082" : "rgba(242,237,226,0.2)",
                    transition: "background 0.3s ease",
                  }}
                />
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 7,
                    letterSpacing: "0.15em",
                    color: i === step ? "#e9c082" : "#49473f",
                    textTransform: "uppercase",
                    transition: "color 0.3s ease",
                  }}
                >
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div
                  style={{
                    width: 24,
                    height: "0.5px",
                    background: i < step ? "#e9c082" : "rgba(242,237,226,0.1)",
                    marginBottom: 14,
                    transition: "background 0.3s ease",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <SuccessState key="success" />
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease }}
            >
              {step === 0 && (
                <>
                  <FloatInput label="Nome completo" value={form.name} onChange={setField("name")} />
                  <FloatInput label="E-mail" type="email" value={form.email} onChange={setField("email")} />
                  <FloatInput label="Telefone" type="tel" value={form.phone} onChange={setField("phone")} />
                </>
              )}

              {step === 1 && (
                <>
                  <div style={{ marginBottom: 28 }}>
                    <div
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 8,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#949087",
                        marginBottom: 16,
                      }}
                    >
                      DISPONIBILIDADE
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {availability.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setField("availability")(opt)}
                          style={{
                            background: form.availability === opt ? "rgba(233,192,130,0.12)" : "transparent",
                            border: `0.5px solid ${form.availability === opt ? "#e9c082" : "rgba(242,237,226,0.15)"}`,
                            padding: "8px 16px",
                            fontFamily: '"Hanken Grotesk", sans-serif',
                            fontSize: 13,
                            fontWeight: 300,
                            color: form.availability === opt ? "#e9c082" : "#949087",
                            cursor: "inherit",
                            transition: "all 0.25s ease",
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <FloatInput
                    label="Detalhes de disponibilidade"
                    value={form.availDetails}
                    onChange={setField("availDetails")}
                  />
                </>
              )}

              {step === 2 && (
                <div style={{ position: "relative", paddingTop: 20, marginBottom: 28 }}>
                  <label
                    style={{
                      display: "block",
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 8,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#e9c082",
                      marginBottom: 12,
                    }}
                  >
                    SUA IDEIA
                  </label>
                  <textarea
                    value={form.idea}
                    onChange={(e) => setField("idea")(e.target.value)}
                    rows={6}
                    placeholder="Símbolos, referências, região do corpo, o que a tatuagem precisa carregar..."
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "0.5px solid rgba(242,237,226,0.15)",
                      outline: "none",
                      fontFamily: '"Hanken Grotesk", sans-serif',
                      fontSize: 14,
                      fontWeight: 300,
                      color: "#F2EDE2",
                      padding: 16,
                      resize: "none",
                      lineHeight: 1.65,
                      boxSizing: "border-box",
                      cursor: "inherit",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "#263C86")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(242,237,226,0.15)")
                    }
                  />
                </div>
              )}

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                {step > 0 ? (
                  <button
                    onClick={back}
                    data-cursor="link"
                    style={{
                      background: "none",
                      border: "none",
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#949087",
                      cursor: "inherit",
                    }}
                  >
                    VOLTAR
                  </button>
                ) : (
                  <div />
                )}
                {step < 2 ? (
                  <button
                    onClick={next}
                    data-cursor="link"
                    style={{
                      background: "none",
                      border: "0.5px solid rgba(242,237,226,0.3)",
                      padding: "10px 24px",
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#F2EDE2",
                      cursor: "inherit",
                      transition: "border-color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLButtonElement).style.borderColor = "#e9c082")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLButtonElement).style.borderColor = "rgba(242,237,226,0.3)")
                    }
                  >
                    PRÓXIMO
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    data-cursor="cta"
                    style={{
                      background: "#F2EDE2",
                      border: "none",
                      padding: "12px 28px",
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 9,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#131412",
                      cursor: "inherit",
                    }}
                  >
                    ENVIAR INTENÇÃO
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

function SuccessState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{ textAlign: "center", padding: "32px 0" }}
    >
      <div style={{ marginBottom: 24 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#e9c082">
          <path d="M12 0 L13.2 10.8 L24 12 L13.2 13.2 L12 24 L10.8 13.2 L0 12 L10.8 10.8 Z" />
        </svg>
      </div>
      <div
        style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: 22,
          fontWeight: 400,
          color: "#F2EDE2",
          marginBottom: 12,
          fontStyle: "italic",
        }}
      >
        intenção recebida.
      </div>
      <div
        style={{
          fontFamily: '"Hanken Grotesk", sans-serif',
          fontSize: 14,
          fontWeight: 300,
          color: "#949087",
          lineHeight: 1.6,
        }}
      >
        a conversa continua pelo WhatsApp.
      </div>
    </motion.div>
  );
}
