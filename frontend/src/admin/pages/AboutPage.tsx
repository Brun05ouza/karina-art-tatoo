import type { DocumentBlock } from "../components/DocumentEditor";
import { ImagePicker } from "../components/ImagePicker";
import { Repeater } from "../components/Repeater";
import { AdminPage } from "../components/Primitives";
import { VisualDocumentEditor } from "../components/VisualDocumentEditor";
import { aboutStore } from "../data/stores";
import type { AboutDocument } from "../data/types";

const ABOUT_BLOCKS: DocumentBlock<AboutDocument>[] = [
  {
    id: "abertura",
    title: "Abertura",
    summary: "Primeira dobra da página Sobre",
    fields: [
      { key: "eyebrow", label: "Texto superior" },
      { key: "title", label: "Título" },
      { key: "intro", label: "Introdução", type: "textarea", rows: 2, full: true },
      { key: "heroImageUrl", label: "Imagem de fundo", type: "image", folder: "sobre/hero", compositionHint: true },
    ],
  },
  {
    id: "biografia",
    title: "Biografia",
    summary: "História, frase e retrato principal",
    fields: [
      { key: "biography", label: "Sua história", type: "textarea", rows: 4, full: true },
      { key: "quote", label: "Frase de destaque", type: "textarea", rows: 2, full: true },
      { key: "imageUrl", label: "Retrato vertical", type: "image", folder: "sobre/retrato" },
    ],
  },
  {
    id: "bastidores",
    title: "Bastidores",
    summary: "Uma foto sua no dia a dia, com uma legenda descontraída",
    fields: [
      { key: "behindScenesCaption", label: "Legenda da foto", type: "textarea", rows: 2, full: true, hint: "Uma frase curta e com personalidade, como se fosse uma legenda de rede social." },
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
    id: "studio",
    title: "Studio",
    summary: "Convite e tour pelas fotos do espaço",
    fields: [
      { key: "studioInviteImageUrl", label: "Imagem do convite", type: "image", folder: "sobre/studio" },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Etapas do tour</span>
        <Repeater
          items={value.studioTourSteps ?? []}
          fields={[
            { key: "imageUrl", label: "Foto", type: "image", folder: "sobre/studio" },
            { key: "label", label: "Rótulo curto" },
            { key: "title", label: "Título" },
            { key: "text", label: "Texto", type: "textarea", rows: 2 },
          ]}
          compact
          addLabel="Adicionar etapa"
          blank={() => ({
            id: crypto.randomUUID(),
            active: true,
            order: 999,
            label: "",
            title: "",
            text: "",
            imageUrl: "",
          })}
          onChange={(studioTourSteps) => update({ studioTourSteps: studioTourSteps as AboutDocument["studioTourSteps"] })}
        />
      </div>
    ),
  },
  {
    id: "abordagem",
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
    <AdminPage eyebrow="Apresentação" title="Sobre" description="Edite a página Sobre por seção: abertura, biografia, studio, bastidores e abordagem.">
      <VisualDocumentEditor<AboutDocument>
        store={aboutStore}
        blocks={ABOUT_BLOCKS}
      />
    </AdminPage>
  );
}
