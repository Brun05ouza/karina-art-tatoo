import { CollectionManager } from "../components/CollectionManager";
import { AdminPage } from "../components/Primitives";
import { faqStore } from "../data/stores";
import type { FaqItem } from "../data/types";

const categories = ["Orçamento", "Projeto", "Sessão", "Cuidados", "Pagamento"];
const empty: FaqItem = { id: "", order: 1, active: true, title: "", answer: "", description: "", category: categories[0], status: "Rascunho" };

export function FaqPage() { return <AdminPage eyebrow="Dúvidas frequentes" title="Perguntas e respostas" description="Mantenha claras as informações que suas clientes mais procuram."><CollectionManager config={{ repository: faqStore, singular: "Pergunta", emptyItem: empty, categories, secondary: (item) => item.answer, fields: [{ key: "title", label: "Pergunta" }, { key: "answer", label: "Resposta", type: "textarea" }, { key: "category", label: "Categoria", type: "select", options: categories }, { key: "status", label: "Status", type: "select", options: ["Publicado", "Rascunho", "Oculto"] }, { key: "active", label: "Pergunta ativa", type: "toggle" }, { key: "order", label: "Ordem", type: "number" }] }} /></AdminPage>; }
