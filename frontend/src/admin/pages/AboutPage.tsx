import type { DocumentBlock } from "../components/DocumentEditor";
import { ImagePicker } from "../components/ImagePicker";
import { Repeater } from "../components/Repeater";
import { AdminPage } from "../components/Primitives";
import { AboutPreview } from "../components/AboutPreview";
import { VisualDocumentEditor } from "../components/VisualDocumentEditor";
import { aboutStore } from "../data/stores";
import type { AboutDocument } from "../data/types";

const ABOUT_BLOCKS: DocumentBlock<AboutDocument>[] = [
  {
    title: "Abertura",
    summary: "Primeira dobra da página Sobre",
    fields: [
      { key: "eyebrow", label: "Texto superior" },
      { key: "title", label: "Título" },
      { key: "intro", label: "Introdução", type: "textarea" },
      { key: "heroImageUrl", label: "Imagem de fundo", type: "image", folder: "sobre/hero" },
    ],
  },
  {
    title: "Biografia",
    summary: "História, frase e retrato principal",
    fields: [
      { key: "biography", label: "Sua história", type: "textarea" },
      { key: "quote", label: "Frase de destaque", type: "textarea" },
      { key: "imageUrl", label: "Retrato vertical", type: "image", folder: "sobre/retrato" },
    ],
  },
  {
    title: "Bastidores",
    summary: "Uma foto sua no dia a dia, com uma legenda descontraída",
    fields: [
      { key: "behindScenesCaption", label: "Legenda da foto", type: "textarea", rows: 2, hint: "Uma frase curta e com personalidade, como se fosse uma legenda de rede social." },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <ImagePicker
          label="Foto de bastidores"
          description="Uma foto real do seu dia a dia — desenhando, tatuando, no ateliê. Aparece grande, com a legenda por cima."
          folder="sobre/bastidores"
          value={value.behindScenesImageUrl}
          onChange={(behindScenesImageUrl) => update({ behindScenesImageUrl })}
        />
      </div>
    ),
  },
  {
    title: "Abordagem",
    summary: "Cards explicativos sobre o seu método",
    fields: [],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Cards de abordagem</span>
        <Repeater
          items={value.approachCards ?? []}
          fields={[
            { key: "title", label: "Título do card" },
            { key: "text", label: "Texto do card", type: "textarea", rows: 2 },
          ]}
          compact
          addLabel="Adicionar card"
          blank={() => ({ id: crypto.randomUUID(), active: true, order: 999, title: "", text: "" })}
          onChange={(newCards) => update({ approachCards: newCards as AboutDocument["approachCards"] })}
        />
      </div>
    ),
  },
];

export function AboutPage() {
  return (
    <AdminPage eyebrow="Apresentação" title="Sobre" description="A prévia agora é a área principal: selecione uma seção no site e ajuste os campos no inspector.">
      <VisualDocumentEditor<AboutDocument>
        store={aboutStore}
        blocks={ABOUT_BLOCKS}
        preview={(value, tools) => <AboutPreview value={value} editor={tools} />}
      />
    </AdminPage>
  );
}
