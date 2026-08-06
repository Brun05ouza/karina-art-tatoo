import { useState } from "react";
import { CollectionManager } from "../components/CollectionManager";
import { DocumentEditor, type DocumentBlock } from "../components/DocumentEditor";
import { AdminPage } from "../components/Primitives";
import { FlashTattoosPreview } from "../components/FlashTattoosPreview";
import { flashStore, flashPageStore } from "../data/stores";
import type { FlashPageDocument, FlashTattoo } from "../data/types";

const categories = ["Botânico", "Símbolos", "Gráfico", "Ornamental", "Minimalista"];
const statuses = ["Disponível", "Reservado", "Tatuado", "Oculto"];
const empty: FlashTattoo = { id: "", order: 1, active: true, title: "", description: "", category: categories[0], status: "Disponível", price: "", size: "", imageUrl: "", imageKey: "" };

const BLOCKS: DocumentBlock<FlashPageDocument>[] = [
  {
    title: "Hero",
    summary: "Textos e imagem da primeira dobra",
    fields: [
      { key: "heroKicker", label: "Texto superior (Kicker)" },
      { key: "heroTitle", label: "Título principal" },
      { key: "heroText", label: "Texto de apoio", type: "textarea", rows: 3, full: true },
      { key: "heroImageUrl", label: "Imagem de fundo", type: "image", full: true },
    ],
  }
];

export function FlashTattoosPage() {
  const [flashes, setFlashes] = useState<FlashTattoo[]>([]);

  return (
    <AdminPage eyebrow="Catálogo" title="Flash tattoos" description="Troque o status de cada desenho rapidamente conforme ele é reservado ou tatuado.">
      <DocumentEditor<FlashPageDocument>
        store={flashPageStore}
        blocks={BLOCKS}
        preview={(doc) => <FlashTattoosPreview doc={doc} items={flashes} />}
      >
        {() => (
          <div className="ksa-block-list">
            <span className="ksa-label">Catálogo de flashes</span>
            <CollectionManager
              config={{
                repository: flashStore,
                singular: "Flash",
                emptyItem: empty,
                categories,
                quickStatuses: statuses,
                onPreviewItemsChange: setFlashes,
                secondary: (item) => `${item.price || "Valor sob consulta"} · ${item.size || "Tamanho livre"}`,
                fields: [
                  { key: "imageUrl", label: "Imagem", type: "image" },
                  { key: "title", label: "Nome do flash" },
                  { key: "description", label: "Descrição", type: "textarea" },
                  { key: "category", label: "Categoria", type: "select", options: categories },
                  { key: "price", label: "Valor" },
                  { key: "size", label: "Tamanho sugerido" },
                  { key: "status", label: "Status", type: "select", options: statuses },
                  { key: "active", label: "Visível no site", type: "toggle" },
                  { key: "order", label: "Ordem", type: "number" }
                ]
              }}
            />
          </div>
        )}
      </DocumentEditor>
    </AdminPage>
  );
}
