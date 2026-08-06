import { useState } from "react";
import { CollectionManager } from "../components/CollectionManager";
import { DocumentEditor, type DocumentBlock } from "../components/DocumentEditor";
import { AdminPage } from "../components/Primitives";
import { ProductsPreview } from "../components/ProductsPreview";
import { productsStore, productsPageStore } from "../data/stores";
import type { ProductsPageDocument, ProductItem } from "../data/types";

const categories = ["Planos de Tattoo", "Flash Tattoos", "Prints & Artes", "Adesivos", "Coleções"];
const empty: ProductItem = { id: "", order: 1, active: true, title: "", description: "", category: categories[0], status: "Rascunho", price: "", whatsappMessage: "", link: "", imageUrl: "", imageKey: "" };

const BLOCKS: DocumentBlock<ProductsPageDocument>[] = [
  {
    title: "Hero",
    summary: "Textos e imagem principal da tela de Coleções",
    fields: [
      { key: "heroKicker", label: "Texto superior (Kicker)" },
      { key: "heroTitle", label: "Título principal" },
      { key: "heroText1", label: "Primeiro parágrafo", type: "textarea", rows: 2, full: true },
      { key: "heroText2", label: "Segundo parágrafo", type: "textarea", rows: 3, full: true },
      { key: "heroButton", label: "Texto do botão" },
      { key: "heroImageUrl", label: "Imagem lateral", type: "image", full: true },
    ],
  },
  {
    title: "Rodapé (CTA)",
    summary: "Faixa final chamando para o WhatsApp",
    fields: [
      { key: "ctaTitle", label: "Título do rodapé" },
      { key: "ctaText", label: "Texto de apoio", type: "textarea", rows: 2, full: true },
      { key: "ctaButton", label: "Texto do botão" },
    ],
  }
];

export function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);

  return (
    <AdminPage eyebrow="Coleções" title="Produtos" description="Edite produtos e seus caminhos de contato, sem transformar o site em uma loja.">
      <DocumentEditor<ProductsPageDocument>
        store={productsPageStore}
        blocks={BLOCKS}
        preview={(doc) => <ProductsPreview doc={doc} items={products} />}
      >
        {() => (
          <div className="ksa-block-list">
            <span className="ksa-label">Lista de Coleções</span>
            <CollectionManager
              config={{
                repository: productsStore,
                singular: "Produto",
                emptyItem: empty,
                categories,
                onPreviewItemsChange: setProducts,
                secondary: (item) => `${item.price || "Sob consulta"} · ${item.category}`,
                fields: [
                  { key: "imageUrl", label: "Imagem", type: "image" },
                  { key: "title", label: "Nome" },
                  { key: "description", label: "Descrição", type: "textarea" },
                  { key: "category", label: "Categoria", type: "select", options: categories },
                  { key: "price", label: "Valor" },
                  { key: "whatsappMessage", label: "Mensagem do WhatsApp", type: "textarea" },
                  { key: "link", label: "Link alternativo" },
                  { key: "status", label: "Status", type: "select", options: ["Publicado", "Rascunho", "Oculto"] },
                  { key: "active", label: "Produto ativo", type: "toggle" },
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
