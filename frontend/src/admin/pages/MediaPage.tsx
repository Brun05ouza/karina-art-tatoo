import { CollectionManager } from "../components/CollectionManager";
import { AdminPage } from "../components/Primitives";
import { mediaStore } from "../data/stores";
import type { MediaItem } from "../data/types";

const categories = ["Home", "Portfólio", "Flash", "Produtos", "Sobre", "Bastidores"];
const empty: MediaItem = { id: "", order: 1, active: true, title: "", description: "", category: categories[0], type: "Imagem", publicUrl: "", usage: "Ainda não utilizada", imageUrl: "", imageKey: "", status: "Publicado" };

export function MediaPage() { return <AdminPage eyebrow="Biblioteca" title="Mídia" description="Encontre imagens, veja onde são usadas e prepare novos arquivos para o futuro upload no R2."><CollectionManager config={{ repository: mediaStore, singular: "Arquivo", emptyItem: empty, categories, secondary: (item) => `${item.usage} · ${item.type}`, fields: [{ key: "imageUrl", label: "Arquivo de imagem", type: "image" }, { key: "title", label: "Nome interno" }, { key: "description", label: "Descrição", type: "textarea" }, { key: "category", label: "Tipo de uso", type: "select", options: categories }, { key: "usage", label: "Onde aparece" }, { key: "publicUrl", label: "URL pública", hint: "Será preenchida automaticamente pelo R2 na próxima etapa." }, { key: "active", label: "Arquivo ativo", type: "toggle" }, { key: "order", label: "Ordem", type: "number" }] }} /></AdminPage>; }
