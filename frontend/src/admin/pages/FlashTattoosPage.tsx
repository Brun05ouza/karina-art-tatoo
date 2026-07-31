import { CollectionManager } from "../components/CollectionManager";
import { AdminPage } from "../components/Primitives";
import { flashStore } from "../data/stores";
import type { FlashTattoo } from "../data/types";

const categories = ["Botânico", "Símbolos", "Gráfico", "Ornamental", "Minimalista"];
const statuses = ["Disponível", "Reservado", "Tatuado", "Oculto"];
const empty: FlashTattoo = { id: "", order: 1, active: true, title: "", description: "", category: categories[0], status: "Disponível", price: "", size: "", imageUrl: "", imageKey: "" };

export function FlashTattoosPage() { return <AdminPage eyebrow="Catálogo" title="Flash tattoos" description="Troque o status de cada desenho rapidamente conforme ele é reservado ou tatuado."><CollectionManager config={{ repository: flashStore, singular: "Flash", emptyItem: empty, categories, quickStatuses: statuses, secondary: (item) => `${item.price || "Valor sob consulta"} · ${item.size || "Tamanho livre"}`, fields: [{ key: "imageUrl", label: "Imagem", type: "image" }, { key: "title", label: "Nome do flash" }, { key: "description", label: "Descrição", type: "textarea" }, { key: "category", label: "Categoria", type: "select", options: categories }, { key: "price", label: "Valor" }, { key: "size", label: "Tamanho sugerido" }, { key: "status", label: "Status", type: "select", options: statuses }, { key: "active", label: "Visível no site", type: "toggle" }, { key: "order", label: "Ordem", type: "number" }] }} /></AdminPage>; }
