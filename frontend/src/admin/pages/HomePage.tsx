import { DocumentEditor, type DocumentBlock } from "../components/DocumentEditor";
import { HomePreview } from "../components/HomePreview";
import { AdminPage } from "../components/Primitives";
import { Repeater } from "../components/Repeater";
import { homeStore } from "../data/stores";
import type { HomeCard, HomeDocument } from "../data/types";

/** Campos comuns aos cards de Serviços e Coleções. */
const CARD_FIELDS = [
  { key: "title", label: "Título" },
  { key: "text", label: "Descrição", type: "textarea" as const },
  { key: "url", label: "Link" },
  { key: "cta", label: "Texto do link" },
];

const blankCard = (): HomeCard => ({ id: crypto.randomUUID(), title: "Novo card", text: "", url: "/", cta: "Ver mais", active: true, order: 0 });

/**
 * Blocos na mesma ordem das seções da home publicada:
 * Hero → Processo criativo → Serviços → Portfólio → Coleções → YouTube → CTA.
 */
const BLOCKS: DocumentBlock<HomeDocument>[] = [
  {
    title: "Hero",
    summary: "Primeira dobra da página",
    fields: [
      { key: "heroEyebrow", label: "Texto superior" },
      { key: "heroTitle", label: "Título principal", type: "textarea" },
      { key: "heroText", label: "Texto de apoio", type: "textarea" },
      { key: "heroButton", label: "Botão principal" },
      { key: "heroButtonUrl", label: "Link do botão principal" },
      { key: "heroSecondaryButton", label: "Botão secundário" },
      { key: "heroSecondaryUrl", label: "Link do botão secundário" },
      { key: "heroImageUrl", label: "Imagem de fundo", type: "image" },
    ],
  },
  {
    title: "Processo criativo",
    summary: "Como o desenho nasce, com o fluxo de etapas",
    fields: [
      { key: "processEyebrow", label: "Texto superior" },
      { key: "processTitle", label: "Título", type: "textarea" },
      { key: "processText", label: "Texto", type: "textarea" },
      { key: "processButton", label: "Texto do botão" },
      { key: "processButtonUrl", label: "Link do botão" },
      { key: "processImageUrl", label: "Imagem", type: "image" },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Etapas do fluxo</span>
        <Repeater
          items={value.processSteps}
          fields={[{ key: "label", label: "Etapa" }]}
          addLabel="Adicionar etapa"
          blank={() => ({ id: crypto.randomUUID(), label: "Nova etapa", active: true, order: 0 })}
          onChange={(processSteps) => update({ processSteps })}
        />
      </div>
    ),
  },
  {
    title: "Serviços",
    summary: "“O que você encontra por aqui”",
    fields: [
      { key: "servicesEyebrow", label: "Texto superior" },
      { key: "servicesTitle", label: "Título" },
      { key: "servicesText", label: "Texto", type: "textarea" },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Cards de serviços</span>
        <Repeater items={value.serviceCards} fields={CARD_FIELDS} addLabel="Adicionar serviço" blank={blankCard} onChange={(serviceCards) => update({ serviceCards })} />
      </div>
    ),
  },
  {
    title: "Portfólio",
    summary: "Trabalhos recentes exibidos na home",
    fields: [
      { key: "portfolioEyebrow", label: "Texto superior" },
      { key: "portfolioTitle", label: "Título" },
      { key: "portfolioText", label: "Texto", type: "textarea" },
      { key: "portfolioMode", label: "Seleção dos trabalhos", type: "select", options: ["automatico", "manual"], hint: "No modo automático a home mostra os trabalhos mais recentes marcados como destaque no Portfólio." },
    ],
  },
  {
    title: "Coleções",
    summary: "Produtos e coleções em destaque",
    fields: [
      { key: "collectionsEyebrow", label: "Texto superior" },
      { key: "collectionsTitle", label: "Título" },
      { key: "collectionsText", label: "Texto", type: "textarea" },
      { key: "collectionsButton", label: "Texto do botão final" },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Cards de coleções</span>
        <Repeater items={value.collectionCards} fields={CARD_FIELDS} addLabel="Adicionar coleção" blank={blankCard} onChange={(collectionCards) => update({ collectionCards })} />
      </div>
    ),
  },
  {
    title: "YouTube",
    summary: "Bastidores e vídeo em destaque",
    fields: [
      { key: "youtubeActive", label: "Exibir seção", type: "toggle" },
      { key: "youtubeEyebrow", label: "Texto superior" },
      { key: "youtubeTitle", label: "Título", type: "textarea" },
      { key: "youtubeText", label: "Texto", type: "textarea" },
      { key: "youtubeButton", label: "Texto do botão" },
      { key: "youtubeUrl", label: "Link do vídeo" },
      { key: "youtubeMeta", label: "Legenda abaixo do botão" },
      { key: "youtubeThumbUrl", label: "Capa do vídeo", type: "image" },
    ],
  },
  {
    title: "Chamada final",
    summary: "Faixa de convite no fim da página",
    fields: [
      { key: "ctaTitle", label: "Título" },
      { key: "ctaText", label: "Texto", type: "textarea" },
      { key: "ctaButton", label: "Texto do botão" },
      { key: "ctaButtonUrl", label: "Link do botão" },
    ],
  },
];

export function HomePage() {
  return (
    <AdminPage eyebrow="Página inicial" title="Home" description="Edite cada seção da página inicial na mesma ordem em que ela aparece no site.">
      <DocumentEditor<HomeDocument> store={homeStore} blocks={BLOCKS} preview={(value) => <HomePreview value={value} />} />
    </AdminPage>
  );
}
