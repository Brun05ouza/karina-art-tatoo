import type { DocumentBlock } from "../components/DocumentEditor";
import { ImagePicker } from "../components/ImagePicker";
import { HomePreview } from "../components/HomePreview";
import { PortfolioSelector } from "../components/PortfolioSelector";
import { AdminPage, ButtonLinkCard, OptionCards } from "../components/Primitives";
import { VideoPicker } from "../components/VideoPicker";
import { VisualDocumentEditor } from "../components/VisualDocumentEditor";
import { Repeater, type RepeaterField } from "../components/Repeater";
import { homeStore } from "../data/stores";
import type { HomeCard, HomeDocument } from "../data/types";

/** Campos comuns aos cards de Serviços e Coleções. */
const CARD_FIELDS = [
  { key: "title", label: "Título" },
  { key: "text", label: "Descrição", type: "textarea" as const },
  { key: "url", label: "Link", type: "internalLink" as const, hint: "Página ou âncora para onde o card leva ao ser clicado. Ex.: /portfolio" },
  { key: "cta", label: "Texto do link", hint: "Texto pequeno no fim do card, ex.: Ver mais" },
];

const COLLECTION_CARD_FIELDS: RepeaterField[] = [
  { key: "imageUrl", label: "Imagem da coleção", type: "image", hint: "Foto que preenche o card inteiro.", folder: "home/colecoes" },
  ...CARD_FIELDS,
];

const SERVICE_CARD_FIELDS: RepeaterField[] = [
  { key: "imageUrl", label: "Imagem da janela", type: "image", hint: "Foto exibida na janelinha, no topo do card.", folder: "home/servicos" },
  ...CARD_FIELDS,
];

const SERVICE_CARD_IMAGES: Record<string, string> = {
  "service-1": "/assets/process/art-process-poster.jpg",
  "service-2": "/assets/hero-home.png",
  "service-3": "/assets/hero-home.png",
  "service-4": "/assets/process/art-process-poster.jpg",
};

const blankCard = (): HomeCard => ({ id: crypto.randomUUID(), title: "Novo card", text: "", url: "/", cta: "Ver mais", imageUrl: "", active: true, order: 0 });

/**
 * Blocos na mesma ordem das seções da home publicada:
 * Hero → Processo criativo → Serviços → Portfólio → Coleções → YouTube → CTA.
 */
const BLOCKS: DocumentBlock<HomeDocument>[] = [
  {
    title: "Hero",
    summary: "Primeira dobra da página",
    fields: [
      { key: "heroEyebrow", label: "Texto superior", hint: "Linha pequena acima do título, em maiúsculas. Ex.: nome da cidade." },
      { key: "heroTitle", label: "Título principal", type: "textarea", rows: 2, hint: "O texto grande de destaque, a primeira coisa que aparece na página." },
      { key: "heroText", label: "Texto de apoio", type: "textarea", rows: 3, full: true, hint: "Frase curta abaixo do título, explicando o que você oferece." },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Botões</span>
        <ButtonLinkCard
          title="Botão principal"
          hint="O botão em destaque, logo abaixo do texto do Hero."
          textValue={String(value.heroButton ?? "")}
          onTextChange={(heroButton) => update({ heroButton })}
          linkValue={String(value.heroButtonUrl ?? "")}
          onLinkChange={(heroButtonUrl) => update({ heroButtonUrl })}
        />
        <ButtonLinkCard
          title="Botão secundário"
          optional
          hint="Aparece ao lado do principal. Deixe o texto vazio para escondê-lo."
          textValue={String(value.heroSecondaryButton ?? "")}
          onTextChange={(heroSecondaryButton) => update({ heroSecondaryButton })}
          linkValue={String(value.heroSecondaryUrl ?? "")}
          onLinkChange={(heroSecondaryUrl) => update({ heroSecondaryUrl })}
        />
        <ImagePicker label="Imagem de fundo" folder="home/hero" value={String(value.heroImageUrl ?? "")} onChange={(heroImageUrl) => update({ heroImageUrl })} />
      </div>
    ),
  },
  {
    title: "Processo criativo",
    summary: "Como o desenho nasce, com o fluxo de etapas",
    fields: [
      { key: "processEyebrow", label: "Texto superior", hint: "Linha pequena acima do título desta seção." },
      { key: "processTitle", label: "Título", type: "textarea", rows: 2, hint: "O título grande desta seção, logo abaixo do Hero." },
      { key: "processText", label: "Texto", type: "textarea", rows: 3, full: true, hint: "Parágrafo de apoio, abaixo do título." },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Botão</span>
        <ButtonLinkCard
          title="Botão"
          hint="Fica no fim do texto desta seção."
          textValue={String(value.processButton ?? "")}
          onTextChange={(processButton) => update({ processButton })}
          linkValue={String(value.processButtonUrl ?? "")}
          onLinkChange={(processButtonUrl) => update({ processButtonUrl })}
        />

        <span className="ksa-label">Imagens</span>
        <ImagePicker
          label="Foto de fundo"
          description="A foto grande que ocupa metade da seção."
          folder="home/processo"
          value={String(value.processImageUrl ?? "")}
          onChange={(processImageUrl) => update({ processImageUrl })}
        />
        <ImagePicker
          label="Retrato em destaque"
          description="Foto menor, dentro da moldura circular, sobreposta à foto de fundo."
          folder="home/processo"
          value={String(value.processPortraitUrl ?? "")}
          onChange={(processPortraitUrl) => update({ processPortraitUrl })}
        />

        <span className="ksa-label">Etapas do fluxo</span>
        <Repeater
          items={value.processSteps}
          fields={[{ key: "label", label: "Etapa" }]}
          compact
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
      { key: "servicesEyebrow", label: "Texto superior", hint: "Linha pequena acima do título desta seção." },
      { key: "servicesTitle", label: "Título", hint: "O título desta seção." },
      { key: "servicesText", label: "Texto", type: "textarea", rows: 3, full: true, hint: "Frase de apoio, abaixo do título." },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Cards de serviços</span>
        <p className="ksa-block-list-note">Cada card é uma das janelas exibidas nesta seção. Use a seta para reordenar e o interruptor para ocultar um card sem excluí-lo.</p>
        <Repeater cards items={value.serviceCards.map((card) => ({ ...card, imageUrl: card.imageUrl ?? SERVICE_CARD_IMAGES[card.id] ?? "" }))} fields={SERVICE_CARD_FIELDS} addLabel="Adicionar serviço" blank={blankCard} onChange={(serviceCards) => update({ serviceCards })} />
      </div>
    ),
  },
  {
    title: "Portfólio",
    summary: "Trabalhos recentes exibidos na home",
    fields: [
      { key: "portfolioEyebrow", label: "Texto superior", hint: "Linha pequena acima do título desta seção." },
      { key: "portfolioTitle", label: "Título", hint: "O título desta seção." },
      { key: "portfolioText", label: "Texto", type: "textarea", rows: 3, full: true, hint: "Frase de apoio, abaixo do título." },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Quais trabalhos aparecem aqui</span>
        <OptionCards
          value={value.portfolioMode}
          onChange={(portfolioMode) => update({ portfolioMode })}
          options={[
            { value: "automatico", label: "Automático", description: "Mostra os trabalhos mais recentes marcados como Destaque no Portfólio." },
            { value: "manual", label: "Escolho eu", description: "Você seleciona exatamente quais trabalhos aparecem, e em que ordem." },
          ]}
        />
        {value.portfolioMode === "manual" && (
          <PortfolioSelector
            selectedIds={value.portfolioIds}
            onChange={(portfolioIds) => update({ portfolioIds })}
          />
        )}
      </div>
    ),
  },
  {
    title: "Coleções",
    summary: "Produtos e coleções em destaque",
    fields: [
      { key: "collectionsEyebrow", label: "Texto superior", hint: "Linha pequena acima do título desta seção." },
      { key: "collectionsTitle", label: "Título", hint: "O título desta seção." },
      { key: "collectionsText", label: "Texto", type: "textarea", rows: 3, full: true, hint: "Frase de apoio, abaixo do título." },
      { key: "collectionsButton", label: "Texto do botão final", hint: "Botão no fim da seção, que leva para a página de Produtos." },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Cards de coleções</span>
        <p className="ksa-block-list-note">Cada card é uma coleção exibida nesta seção. Use a seta para reordenar e o interruptor para ocultar um card sem excluí-lo.</p>
        <Repeater cards items={value.collectionCards} fields={COLLECTION_CARD_FIELDS} addLabel="Adicionar coleção" blank={blankCard} onChange={(collectionCards) => update({ collectionCards })} />
      </div>
    ),
  },
  {
    title: "YouTube",
    summary: "Bastidores e vídeo em destaque",
    fields: [
      { key: "youtubeActive", label: "Exibir seção", type: "toggle", hint: "Desligue para esconder esta seção da home sem perder o conteúdo preenchido." },
      { key: "youtubeEyebrow", label: "Texto superior", hint: "Linha pequena acima do título desta seção." },
      { key: "youtubeTitle", label: "Título", type: "textarea", rows: 2, hint: "O título desta seção." },
      { key: "youtubeText", label: "Texto", type: "textarea", rows: 3, full: true, hint: "Frase de apoio, abaixo do título." },
      { key: "youtubeMeta", label: "Legenda abaixo do botão", hint: "Texto pequeno, ex.: nome do episódio ou duração do vídeo." },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Botão</span>
        <ButtonLinkCard
          title="Botão do vídeo"
          hint="Abre o vídeo no YouTube."
          textLabel="Texto do botão"
          textValue={String(value.youtubeButton ?? "")}
          onTextChange={(youtubeButton) => update({ youtubeButton })}
          linkValue={String(value.youtubeUrl ?? "")}
          onLinkChange={(youtubeUrl) => update({ youtubeUrl })}
          linkHint="Endereço do vídeo no YouTube."
          internalLinks={false}
        />

        <span className="ksa-label">Imagens e vídeo</span>
        <ImagePicker
          label="Capa do vídeo"
          description="Miniatura exibida como se fosse a thumb do vídeo no YouTube."
          folder="home/youtube"
          value={String(value.youtubeThumbUrl ?? "")}
          onChange={(youtubeThumbUrl) => update({ youtubeThumbUrl })}
        />
        <VideoPicker
          label="Trailer vertical"
          description="Vídeo curto e vertical (formato Reels/Stories), exibido ao lado da capa dentro de uma moldura de celular."
          folder="home/youtube"
          value={String(value.youtubeTrailerUrl ?? "")}
          onChange={(youtubeTrailerUrl) => update({ youtubeTrailerUrl })}
        />
      </div>
    ),
  },
  {
    title: "Chamada final",
    summary: "Faixa de convite no fim da página",
    fields: [
      { key: "ctaTitle", label: "Título" },
      { key: "ctaText", label: "Texto", type: "textarea", rows: 3, full: true },
      { key: "ctaButton", label: "Texto do botão" },
      { key: "ctaButtonUrl", label: "Link do botão" },
    ],
  },
];

export function HomePage() {
  return (
    <AdminPage eyebrow="Página inicial" title="Home" description="A prévia agora é a área principal: selecione uma seção no site e ajuste os campos no inspetor.">
      <VisualDocumentEditor<HomeDocument> store={homeStore} blocks={BLOCKS} preview={(value, editor) => <HomePreview value={value} editor={editor} />} />
    </AdminPage>
  );
}
