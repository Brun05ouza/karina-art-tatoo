import { AlertTriangle, ArrowUpRight, CheckCircle2, LifeBuoy, MessageCircle, SlidersHorizontal } from "lucide-react";
import { AdminCard, AdminPage } from "../components/Primitives";
import { StarDecor } from "../components/StarDecor";

const supportNotes = [
  {
    title: "Imagem nao subiu ou sumiu",
    text: "Nao tenta insistir mil vezes. Chama o Bruno e manda qual pagina estava editando.",
    icon: AlertTriangle,
  },
  {
    title: "Texto salvou estranho",
    text: "Se algo ficar desalinhado, cortado ou diferente da previa, manda print com o trecho marcado.",
    icon: MessageCircle,
  },
  {
    title: "Mudanca nao apareceu no site",
    text: "Atualiza a pagina uma vez. Se continuar igual, fala com o Bruno para conferir banco e cache.",
    icon: CheckCircle2,
  },
];

const brunoWhatsappUrl = `https://wa.me/5521965272231?text=${encodeURIComponent("Deu um problema no painel.")}`;

export function SupportPage() {
  return (
    <AdminPage
      eyebrow="Contato dev"
      title="Contato com o dev"
      description="Um cantinho rapido para chamar o Bruno quando alguma coisa parecer fora do lugar."
    >
      <section className="ksa-support-hero">
        <StarDecor />
        <span><SlidersHorizontal size={16} /> Contato com o dev</span>
        <h2>Se algo parecer estranho, chama o Bruno.</h2>
        <p>
          O painel salva o conteudo no banco e envia imagens para o bucket. Se alguma etapa travar,
          o melhor caminho e mandar o print, a pagina e o que voce tentou fazer.
        </p>
      </section>

      <div className="ksa-support-grid">
        {supportNotes.map(({ title, text, icon: Icon }) => (
          <article className="ksa-support-note" key={title}>
            <span><Icon size={18} /></span>
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <AdminCard title="Contato com o dev" description="Use quando tiver duvida, erro visual ou qualquer comportamento inesperado.">
        <div className="ksa-support-contact">
          <a href={brunoWhatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            <span>
              <strong>(21) 96527-2231</strong>
              <small>Contato rapido pelo WhatsApp</small>
            </span>
            <ArrowUpRight size={16} />
          </a>
          <a href="https://brunosouza.dev.br" target="_blank" rel="noreferrer">
            <LifeBuoy size={18} />
            <span>
              <strong>brunosouza.dev.br</strong>
              <small>Portfolio e contato do Bruno Souza</small>
            </span>
            <ArrowUpRight size={16} />
          </a>
        </div>
      </AdminCard>
    </AdminPage>
  );
}
