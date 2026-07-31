import { DocumentEditor } from "../components/DocumentEditor";
import { AdminPage } from "../components/Primitives";
import { backstageStore } from "../data/stores";
import type { BackstageDocument } from "../data/types";

export function BastidoresPage() { return <AdminPage eyebrow="Processo criativo" title="Bastidores" description="Organize os conteúdos que mostram o processo, o ateliê e o cuidado antes da sessão."><DocumentEditor<BackstageDocument> store={backstageStore} blocks={[
  { title: "Abertura", fields: [{ key: "active", label: "Seção ativa", type: "toggle" }, { key: "eyebrow", label: "Texto superior" }, { key: "title", label: "Título" }, { key: "intro", label: "Introdução", type: "textarea" }] },
  { title: "Vídeo", fields: [{ key: "videoUrl", label: "URL do vídeo" }, { key: "videoPoster", label: "Imagem de capa", type: "image" }] },
  { title: "Processo", fields: [{ key: "processTitle", label: "Título" }, { key: "processText", label: "Texto", type: "textarea" }] },
]} /></AdminPage>; }
