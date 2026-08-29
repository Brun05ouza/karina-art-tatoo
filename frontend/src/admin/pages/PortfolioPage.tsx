import { useMemo } from "react";
import { CollectionManager } from "../components/CollectionManager";
import type { DocumentBlock } from "../components/DocumentEditor";
import { AdminPage } from "../components/Primitives";
import { VisualDocumentEditor } from "../components/VisualDocumentEditor";
import { portfolioPageStore, portfolioStore } from "../data/stores";
import type { PortfolioItem, PortfolioPageDocument } from "../data/types";

const categories = ["Fine Line", "Minimalista", "Blackwork", "Projetos Autorais", "Flash Tattoo", "Cicatrizadas"];
const bodyLocations = ["Braço", "Antebraço", "Costas", "Coxa", "Perna", "Costela", "Ombro", "Pescoço", "Mão", "Tornozelo"];
const styles = ["Fine Line", "Minimalista", "Blackwork", "Botânico", "Ornamental", "Autoral", "Geométrico", "Floral"];
const empty: PortfolioItem = { id: "", order: 1, active: true, title: "", description: "", category: categories[0], status: "Rascunho", bodyLocation: "", style: "", featured: false, imageUrl: "", imageKey: "" };

export function PortfolioPage() {
  const blocks = useMemo<DocumentBlock<PortfolioPageDocument>[]>(() => [
    {
      title: "Hero",
      summary: "Textos e imagem da primeira dobra",
      fields: [
        { key: "heroKicker", label: "Texto superior", hint: "Linha pequena acima do título." },
        { key: "heroTitle", label: "Título principal", hint: "O título grande desta página." },
        { key: "heroText", label: "Texto de apoio", type: "textarea", rows: 2, full: true, hint: "Frase abaixo do título, explicando o que a página mostra." },
        { key: "heroImageUrl", label: "Imagem de fundo", type: "image", folder: "portfolio/hero", full: true, compositionHint: true },
      ],
    },
    {
      title: "Trabalhos",
      summary: "Cards cadastrados no portfólio",
      fields: [],
      render: () => (
        <div className="ksa-block-list">
          <span className="ksa-label">Trabalhos do portfólio</span>
          <CollectionManager
            config={{
              repository: portfolioStore,
              singular: "Trabalho",
              emptyItem: empty,
              categories,
              secondary: (item) => `${item.bodyLocation || "Local não informado"} · ${item.style || "Estilo não informado"}`,
              fields: [
                { key: "imageUrl", label: "Imagem do trabalho", type: "image", folder: "portfolio/trabalhos" },
                { key: "title", label: "Título" },
                { key: "description", label: "Descrição curta", type: "textarea" },
                { key: "category", label: "Categoria", type: "select", options: categories, allowCustom: true },
                { key: "bodyLocation", label: "Local do corpo", type: "select", options: bodyLocations, allowCustom: true },
                { key: "style", label: "Estilo", type: "select", options: styles, allowCustom: true },
                { key: "status", label: "Status", type: "select", options: ["Publicado", "Rascunho", "Oculto"] },
                { key: "featured", label: "Mostrar na home", type: "toggle" },
                { key: "active", label: "Item ativo", type: "toggle" },
              ],
            }}
          />
        </div>
      ),
    },
  ], []);

  return (
    <AdminPage eyebrow="Trabalhos" title="Portfólio" description="Edite o hero e os trabalhos do portfólio.">
      <VisualDocumentEditor<PortfolioPageDocument>
        store={portfolioPageStore}
        blocks={blocks}
      />
    </AdminPage>
  );
}
