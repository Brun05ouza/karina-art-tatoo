import { useMemo, useState } from "react";
import { CollectionManager } from "../components/CollectionManager";
import type { DocumentBlock } from "../components/DocumentEditor";
import { AdminPage } from "../components/Primitives";
import { FlashTattoosPreview } from "../components/FlashTattoosPreview";
import { VisualDocumentEditor } from "../components/VisualDocumentEditor";
import { flashStore, flashPageStore } from "../data/stores";
import type { FlashPageDocument, FlashTattoo } from "../data/types";

const categories = ["Botânico", "Símbolos", "Gráfico", "Ornamental", "Minimalista"];
const statuses = ["Disponível", "Reservado", "Tatuado", "Oculto"];
const sizes = ["Até 8 cm", "10 cm", "12 cm", "15 cm", "Tamanho livre", "Sob consulta"];

const empty: FlashTattoo = {
  id: "",
  order: 1,
  active: true,
  title: "",
  description: "",
  category: categories[0],
  status: "Disponível",
  price: "",
  size: "",
  imageUrl: "",
  imageKey: "",
};

const HERO_BLOCK: DocumentBlock<FlashPageDocument> = {
  title: "Hero",
  summary: "Textos e imagem da primeira dobra",
  fields: [
    { key: "heroKicker", label: "Texto superior" },
    { key: "heroTitle", label: "Título principal" },
    { key: "heroText", label: "Texto de apoio", type: "textarea", rows: 3, full: true },
    { key: "heroImageUrl", label: "Imagem de fundo", type: "image", folder: "flash-tattoos/hero", full: true },
  ],
};

export function FlashTattoosPage() {
  const [flashes, setFlashes] = useState<FlashTattoo[]>([]);

  const blocks = useMemo<DocumentBlock<FlashPageDocument>[]>(() => [
    HERO_BLOCK,
    {
      title: "Catálogo",
      summary: "Desenhos disponíveis, reservados e tatuados",
      fields: [],
      render: () => (
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
                { key: "imageUrl", label: "Imagem", type: "image", folder: "flash-tattoos/catalogo", full: true },
                { key: "title", label: "Nome do flash" },
                { key: "description", label: "Descrição", type: "textarea" },
                { key: "category", label: "Categoria", type: "select", options: categories, allowCustom: true },
                { key: "price", label: "Valor", type: "currency" },
                { key: "size", label: "Tamanho sugerido", type: "select", options: sizes, allowCustom: true },
                { key: "status", label: "Status", type: "select", options: statuses },
                { key: "active", label: "Visível no site", type: "toggle" },
              ],
            }}
          />
        </div>
      ),
    },
  ], []);

  return (
    <AdminPage
      eyebrow="Catálogo"
      title="Flash tattoos"
      description="A prévia agora é a área principal: selecione o Hero ou o catálogo e ajuste no inspector."
    >
      <VisualDocumentEditor<FlashPageDocument>
        store={flashPageStore}
        blocks={blocks}
        preview={(doc, tools) => <FlashTattoosPreview doc={doc} items={flashes} editor={tools} />}
      />
    </AdminPage>
  );
}
