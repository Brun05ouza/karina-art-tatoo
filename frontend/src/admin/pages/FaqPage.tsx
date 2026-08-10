import { CollectionManager } from "../components/CollectionManager";
import { AdminPage } from "../components/Primitives";
import { faqStore } from "../data/stores";
import type { FaqItem } from "../data/types";

const categories = ["Orçamento", "Projeto", "Sessão", "Cuidados", "Pagamento"];

const empty: FaqItem = {
  id: "",
  order: 1,
  active: true,
  title: "",
  answer: "",
  description: "",
  category: categories[0],
  status: "Rascunho",
};

export function FaqPage() {
  return (
    <AdminPage
      eyebrow="Dúvidas frequentes"
      title="Perguntas e respostas"
      description="Esse conteúdo alimenta o FAQ completo e o FAQ rápido que aparece em Produtos."
    >
      <CollectionManager
        config={{
          repository: faqStore,
          singular: "Pergunta",
          emptyItem: empty,
          categories,
          secondary: (item) => item.answer,
          fields: [
            { key: "title", label: "Pergunta", full: true },
            { key: "answer", label: "Resposta", type: "textarea", full: true },
            {
              key: "category",
              label: "Categoria",
              type: "select",
              options: categories,
              allowCustom: true,
              placeholder: "Selecionar categoria",
            },
            {
              key: "status",
              label: "Status",
              type: "select",
              options: ["Publicado", "Rascunho", "Oculto"],
            },
            { key: "active", label: "Pergunta visível no site", type: "toggle" },
          ],
        }}
      />
    </AdminPage>
  );
}
