import { ArrowRight, CircleHelp, GalleryVerticalEnd, Package, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AdminCard, AdminPage, Toggle } from "../components/Primitives";
import { LoadingState } from "../components/States";
import { StarDecor } from "../components/StarDecor";
import { faqStore, flashStore, portfolioStore, productsStore, siteModeStore } from "../data/stores";
import type { SiteModeDocument } from "../data/types";

const MOTIVATIONAL_MESSAGES = [
  "Respira. Um passo de cada vez também leva longe.",
  "Hoje pode ser simples e ainda assim ser um bom dia.",
  "Bebe uma água, ajeita a postura e vai no seu ritmo.",
  "Nem tudo precisa estar perfeito para começar.",
  "Começa pelo mais fácil. O resto vai destravando no caminho.",
  "Pequenas vitórias também contam. Inclusive responder mensagem sem esquecer.",
  "Se der ruim, a gente chama de processo criativo.",
  "Hoje é um ótimo dia para não brigar com a própria cabeça.",
  "Faz com calma. Pressa quase nunca combina com coisa bem feita.",
  "Às vezes o plano é só não surtar e escolher uma boa música.",
  "Se o dia estiver estranho, pelo menos o café pode estar certo.",
  "Uma pausa também é parte do trabalho. O cérebro agradece.",
  "Não precisa resolver a vida inteira antes do almoço.",
  "Vai no modo possível. O modo perfeito está sempre atrasado.",
  "Organiza uma coisa pequena e comemora como adulta funcional.",
  "Hoje pede leveza, foco e um pouquinho de deboche saudável.",
  "Se ninguém te falou ainda: você está dando conta melhor do que parece.",
  "Que a rotina tenha menos cobrança e mais respiro.",
  "O caos existe, mas a gente pode colocar ele em ordem de prioridade.",
  "Lembrete oficial: strogonoff com feijão é crime. Sem negociação.",
  "Se colocou feijão no strogonoff, hoje é dia de repensar escolhas.",
  "Que o drama fique só na novela. Na vida real, a gente respira e resolve.",
  "Fazer aos poucos ainda é fazer.",
  "Tem dias que o milagre é só abrir o painel. Já vale.",
];

function randomMotivationalMessage() {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)] ?? MOTIVATIONAL_MESSAGES[0];
}

function nextMotivationalMessage(current: string) {
  const options = MOTIVATIONAL_MESSAGES.filter((message) => message !== current);
  return options[Math.floor(Math.random() * options.length)] ?? randomMotivationalMessage();
}

export function DashboardPage() {
  const [counts, setCounts] = useState<{ portfolio: number; flashes: number; products: number; faq: number } | null>(null);
  const [motivationalMessage, setMotivationalMessage] = useState(randomMotivationalMessage);
  const [siteMode, setSiteMode] = useState<SiteModeDocument | null>(null);
  const [siteModeStatus, setSiteModeStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    void Promise.all([portfolioStore.list(), flashStore.list(), productsStore.list(), faqStore.list()]).then(([portfolio, flashes, products, faq]) => {
      setCounts({
        portfolio: portfolio.filter((item) => item.status === "Publicado").length,
        flashes: flashes.filter((item) => item.status === "Disponível").length,
        products: products.filter((item) => item.active).length,
        faq: faq.filter((item) => item.active).length,
      });
    });
  }, []);

  useEffect(() => {
    void siteModeStore.read().then(setSiteMode).catch(() => setSiteModeStatus("error"));
  }, []);

  const updateDevelopmentMode = (developmentMode: boolean) => {
    if (!siteMode) return;

    const nextMode = { ...siteMode, developmentMode };
    setSiteMode(nextMode);
    setSiteModeStatus("saving");

    void siteModeStore.write(nextMode)
      .then((saved) => {
        setSiteMode(saved);
        setSiteModeStatus("saved");
        window.setTimeout(() => setSiteModeStatus("idle"), 1800);
      })
      .catch(() => {
        setSiteMode(siteMode);
        setSiteModeStatus("error");
      });
  };

  const quickLinks = [
    ["Adicionar trabalho", "/admin/portfolio"],
    ["Atualizar flashes", "/admin/flash-tattoos"],
    ["Editar Home", "/admin/home"],
    ["Revisar produtos", "/admin/produtos"],
  ];
  const developmentPreviewImage = siteMode?.developmentImageUrl?.trim() ?? "";

  return (
    <AdminPage
      eyebrow="Visão geral"
      title="Bem-vinda, Karina"
      description="Aqui está um retrato rápido do conteúdo que está pronto para aparecer no site."
    >
      <div className="ksa-dashboard-hero">
        <StarDecor />
        <p key={motivationalMessage} className="ksa-dashboard-hero-message">
          {motivationalMessage}
        </p>
        <button
          className="ksa-dashboard-hero-refresh"
          type="button"
          onClick={() => setMotivationalMessage((current) => nextMotivationalMessage(current))}
          aria-label="Recarregar frase"
          title="Recarregar frase"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {!counts ? (
        <LoadingState />
      ) : (
        <div className="ksa-stats">
          <Stat icon={<GalleryVerticalEnd />} value={counts.portfolio} label="Trabalhos publicados" />
          <Stat icon={<Sparkles />} value={counts.flashes} label="Flashes disponíveis" />
          <Stat icon={<Package />} value={counts.products} label="Produtos ativos" />
          <Stat icon={<CircleHelp />} value={counts.faq} label="Perguntas no FAQ" />
        </div>
      )}

      <AdminCard
        className="ksa-development-mode-card"
        title="Modo em desenvolvimento"
        description="Quando estiver ligado, a Home pública mostra uma tela especial avisando que o site está em desenvolvimento."
        action={
          <Toggle
            checked={Boolean(siteMode?.developmentMode)}
            onChange={updateDevelopmentMode}
            label={siteMode?.developmentMode ? "Ligado" : "Desligado"}
            ariaLabel="Ativar modo em desenvolvimento"
          />
        }
      >
        <div className="ksa-development-mode-preview">
          {developmentPreviewImage ? (
            <img src={developmentPreviewImage} alt="" />
          ) : (
            <span className="ksa-development-mode-preview-empty" aria-hidden="true">
              <Sparkles size={22} />
            </span>
          )}
          <div>
            <span>{siteMode?.developmentMode ? "Visitantes vendo aviso" : "Site normal no ar"}</span>
            <strong>{siteMode?.developmentTitle || "Esse site está em desenvolvimento"}</strong>
            <p>{siteMode?.developmentText || "Estou preparando esse espaço com carinho."}</p>
            <small>
              {siteModeStatus === "saving"
                ? "Salvando mudança..."
                : siteModeStatus === "saved"
                  ? "Mudança salva no banco."
                  : siteModeStatus === "error"
                    ? "Não consegui salvar agora. Tenta de novo."
                    : "Essa configuração vale só para a Home."}
            </small>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Atalhos frequentes" description="Vá direto ao conteúdo que muda com mais frequência.">
        <div className="ksa-quick-links">
          {quickLinks.map(([label, to]) => (
            <Link key={to} to={to}>
              {label}
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </AdminCard>
    </AdminPage>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <article className="ksa-stat">
      <span>{icon}</span>
      <strong>{value}</strong>
      <p>{label}</p>
    </article>
  );
}
