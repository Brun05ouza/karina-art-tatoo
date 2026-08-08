import { useState } from "react";
import { CollectionManager } from "../components/CollectionManager";
import { DocumentEditor, type DocumentBlock } from "../components/DocumentEditor";
import { PortfolioPreview } from "../components/PortfolioPreview";
import { AdminPage } from "../components/Primitives";
import { portfolioStore, portfolioPageStore } from "../data/stores";
import type { PortfolioItem, PortfolioPageDocument } from "../data/types";

const categories = ["Fine Line", "Minimalista", "Blackwork", "Projetos Autorais", "Flash Tattoo", "Cicatrizadas"];
const empty: PortfolioItem = { id: "", order: 1, active: true, title: "", description: "", category: categories[0], status: "Rascunho", bodyLocation: "", style: "", featured: false, imageUrl: "", imageKey: "" };

const BLOCKS: DocumentBlock<PortfolioPageDocument>[] = [
  {
    title: "Hero",
    summary: "Textos e imagem da primeira dobra",
    fields: [
      { key: "heroKicker", label: "Texto superior", hint: "Linha pequena acima do título." },
      { key: "heroTitle", label: "Título principal", hint: "O título grande desta página." },
      { key: "heroText", label: "Texto de apoio", type: "textarea", rows: 3, full: true, hint: "Frase abaixo do título, explicando o que a página mostra." },
      { key: "heroImageUrl", label: "Imagem de fundo", type: "image", full: true },
    ],
  },
];

export function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  return (
    <AdminPage eyebrow="Trabalhos" title="Portfólio" description="Organize os projetos que apresentam seu trabalho e escolha os destaques da Home.">
      <DocumentEditor<PortfolioPageDocument>
        store={portfolioPageStore}
        blocks={BLOCKS}
        preview={(doc) => <PortfolioPreview doc={doc} items={portfolioItems} />}
      >
        {() => (
          <div className="ksa-block-list">
            <span className="ksa-label">Trabalhos do portfólio</span>
            <CollectionManager
              config={{
                repository: portfolioStore,
                singular: "Trabalho",
                emptyItem: empty,
                categories,
                onPreviewItemsChange: setPortfolioItems,
                secondary: (item) => `${item.bodyLocation || "Local não informado"} · ${item.style || "Estilo não informado"}`,
                fields: [
                  { key: "imageUrl", label: "Imagem do trabalho", type: "image" },
                  { key: "title", label: "Título" },
                  { key: "description", label: "Descrição curta", type: "textarea" },
                  { key: "category", label: "Categoria", type: "select", options: categories },
                  { key: "bodyLocation", label: "Local do corpo" },
                  { key: "style", label: "Estilo" },
                  { key: "status", label: "Status", type: "select", options: ["Publicado", "Rascunho", "Oculto"] },
                  { key: "featured", label: "Destaque na Home", type: "toggle" },
                  { key: "active", label: "Item ativo", type: "toggle" },
                  { key: "order", label: "Ordem", type: "number" },
                ],
              }}
            />
          </div>
        )}
      </DocumentEditor>
    </AdminPage>
  );
}
