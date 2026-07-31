import { CollectionManager } from "../components/CollectionManager";
import { AdminPage } from "../components/Primitives";
import { productsStore } from "../data/stores";
import type { ProductItem } from "../data/types";

const categories = ["Planos de Tattoo", "Flash Tattoos", "Prints & Artes", "Adesivos", "Coleções"];
const empty: ProductItem = { id: "", order: 1, active: true, title: "", description: "", category: categories[0], status: "Rascunho", price: "", whatsappMessage: "", link: "", imageUrl: "", imageKey: "" };

export function ProductsPage() { return <AdminPage eyebrow="Coleções" title="Produtos" description="Edite produtos e seus caminhos de contato, sem transformar o site em uma loja."><CollectionManager config={{ repository: productsStore, singular: "Produto", emptyItem: empty, categories, secondary: (item) => `${item.price || "Sob consulta"} · ${item.category}`, fields: [{ key: "imageUrl", label: "Imagem", type: "image" }, { key: "title", label: "Nome" }, { key: "description", label: "Descrição", type: "textarea" }, { key: "category", label: "Categoria", type: "select", options: categories }, { key: "price", label: "Valor" }, { key: "whatsappMessage", label: "Mensagem do WhatsApp", type: "textarea" }, { key: "link", label: "Link alternativo" }, { key: "status", label: "Status", type: "select", options: ["Publicado", "Rascunho", "Oculto"] }, { key: "active", label: "Produto ativo", type: "toggle" }, { key: "order", label: "Ordem", type: "number" }] }} /></AdminPage>; }
