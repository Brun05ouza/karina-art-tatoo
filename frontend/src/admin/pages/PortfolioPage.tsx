import { CollectionManager } from "../components/CollectionManager";
import { PortfolioPreview } from "../components/PortfolioPreview";
import { AdminPage } from "../components/Primitives";
import { portfolioStore } from "../data/stores";
import type { PortfolioItem } from "../data/types";

const categories = ["Fine Line", "Minimalista", "Blackwork", "Projetos Autorais", "Flash Tattoo", "Cicatrizadas"];
const empty: PortfolioItem = { id: "", order: 1, active: true, title: "", description: "", category: categories[0], status: "Rascunho", bodyLocation: "", style: "", featured: false, imageUrl: "", imageKey: "" };

export function PortfolioPage() { return <AdminPage eyebrow="Trabalhos" title="Portfólio" description="Organize os projetos que apresentam seu trabalho e escolha os destaques da Home."><CollectionManager config={{ repository: portfolioStore, singular: "Trabalho", emptyItem: empty, categories, preview: (items) => <PortfolioPreview items={items} />, secondary: (item) => `${item.bodyLocation || "Local não informado"} · ${item.style || "Estilo não informado"}`, fields: [{ key: "imageUrl", label: "Imagem do trabalho", type: "image" }, { key: "title", label: "Título" }, { key: "description", label: "Descrição curta", type: "textarea" }, { key: "category", label: "Categoria", type: "select", options: categories }, { key: "bodyLocation", label: "Local do corpo" }, { key: "style", label: "Estilo" }, { key: "status", label: "Status", type: "select", options: ["Publicado", "Rascunho", "Oculto"] }, { key: "featured", label: "Destaque na Home", type: "toggle" }, { key: "active", label: "Item ativo", type: "toggle" }, { key: "order", label: "Ordem", type: "number" }] }} /></AdminPage>; }
