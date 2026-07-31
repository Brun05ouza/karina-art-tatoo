import { DocumentEditor } from "../components/DocumentEditor";
import { AdminPage } from "../components/Primitives";
import { aboutStore } from "../data/stores";
import type { AboutDocument } from "../data/types";

export function AboutPage() { return <AdminPage eyebrow="Apresentação" title="Sobre" description="Conte sua trajetória e deixe clara a intenção por trás do seu trabalho."><DocumentEditor<AboutDocument> store={aboutStore} blocks={[
  { title: "Abertura", fields: [{ key: "eyebrow", label: "Texto superior" }, { key: "title", label: "Título" }, { key: "intro", label: "Introdução", type: "textarea" }, { key: "imageUrl", label: "Retrato", type: "image" }] },
  { title: "Biografia", fields: [{ key: "biography", label: "Sua história", type: "textarea" }, { key: "quote", label: "Frase de destaque", type: "textarea" }] },
  { title: "Abordagem", fields: [{ key: "approachTitle", label: "Título" }, { key: "approachText", label: "Texto", type: "textarea" }] },
]} /></AdminPage>; }
