import type { DocumentBlock } from "../components/DocumentEditor";
import { AdminPage } from "../components/Primitives";
import { VisualDocumentEditor } from "../components/VisualDocumentEditor";
import { budgetPageStore } from "../data/stores";
import type { BudgetPageDocument } from "../data/types";

const BLOCKS: DocumentBlock<BudgetPageDocument>[] = [
  {
    title: "Hero",
    summary: "Primeira dobra da página de orçamento",
    fields: [
      { key: "heroKicker", label: "Texto superior" },
      { key: "heroTitle", label: "Título principal" },
      { key: "heroText", label: "Texto de apoio", type: "textarea", rows: 2, full: true },
      { key: "heroImageUrl", label: "Imagem de fundo", type: "image", folder: "orcamento/hero", full: true, compositionHint: true },
    ],
  },
  {
    title: "Briefing",
    summary: "Texto explicativo e etapas antes do formulário",
    fields: [
      { key: "introEyebrow", label: "Texto superior" },
      { key: "introTitle", label: "Título" },
      { key: "introText", label: "Texto", type: "textarea", rows: 2, full: true },
      { key: "stepOneTitle", label: "Etapa 01 · título" },
      { key: "stepOneText", label: "Etapa 01 · texto", type: "textarea", rows: 2 },
      { key: "stepTwoTitle", label: "Etapa 02 · título" },
      { key: "stepTwoText", label: "Etapa 02 · texto", type: "textarea", rows: 2 },
      { key: "stepThreeTitle", label: "Etapa 03 · título" },
      { key: "stepThreeText", label: "Etapa 03 · texto", type: "textarea", rows: 2 },
    ],
  },
  {
    title: "Formulário",
    summary: "Cabeçalho, botão e mensagem inicial enviada ao WhatsApp",
    fields: [
      { key: "formEyebrow", label: "Texto superior" },
      { key: "formTitle", label: "Título do formulário" },
      { key: "submitHelper", label: "Texto antes do botão", type: "textarea", rows: 2, full: true },
      { key: "submitButton", label: "Texto do botão" },
      { key: "whatsappIntro", label: "Mensagem inicial do WhatsApp", type: "textarea", rows: 2, full: true },
    ],
  },
];

export function BudgetPage() {
  return (
    <AdminPage
      eyebrow="Orçamento"
      title="Orçamento"
      description="Edite a página de orçamento e a mensagem inicial enviada para o WhatsApp."
    >
      <VisualDocumentEditor<BudgetPageDocument>
        store={budgetPageStore}
        blocks={BLOCKS}
      />
    </AdminPage>
  );
}
