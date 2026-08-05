import { DocumentEditor } from "../components/DocumentEditor";
import { Repeater } from "../components/Repeater";
import { AdminPage } from "../components/Primitives";
import { AboutPreview } from "../components/AboutPreview";
import { aboutStore } from "../data/stores";
import type { AboutDocument } from "../data/types";

export function AboutPage() { return <AdminPage eyebrow="Apresentação" title="Sobre" description="Conte sua trajetória e deixe clara a intenção por trás do seu trabalho."><DocumentEditor<AboutDocument> store={aboutStore} preview={(value) => <AboutPreview value={value} />} blocks={[
  { title: "Abertura", fields: [{ key: "eyebrow", label: "Texto superior" }, { key: "title", label: "Título" }, { key: "intro", label: "Introdução", type: "textarea" }, { key: "heroImageUrl", label: "Imagem de fundo", type: "image" }] },
  { title: "Biografia", fields: [{ key: "biography", label: "Sua história", type: "textarea" }, { key: "quote", label: "Frase de destaque", type: "textarea" }, { key: "imageUrl", label: "Retrato (Vertical)", type: "image" }] },
  { 
    title: "Abordagem", 
    summary: "Cards explicativos sobre o seu método",
    fields: [], 
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Cards de abordagem</span>
        <Repeater
          items={value.approachCards ?? []}
          fields={[{ key: "title", label: "Título do card" }, { key: "text", label: "Texto do card", type: "textarea", rows: 2 }]}
          compact
          addLabel="Adicionar card"
          blank={() => ({ id: crypto.randomUUID(), active: true, order: 999, title: "", text: "" })}
          onChange={(newCards) => update({ approachCards: newCards as any })}
        />
      </div>
    )
  },
]} /></AdminPage>; }
