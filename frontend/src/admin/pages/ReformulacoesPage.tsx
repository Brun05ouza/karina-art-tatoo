import { useMemo } from "react";
import { CollectionManager } from "../components/CollectionManager";
import type { DocumentBlock } from "../components/DocumentEditor";
import { AdminPage, Field, TextArea, TextInput } from "../components/Primitives";
import { VisualDocumentEditor } from "../components/VisualDocumentEditor";
import { reformulationsStore, reformulationsTextStore } from "../data/stores";
import type { ReformulationCard, ReformulationItem, ReformulationPoint, ReformulationsDocument } from "../data/types";

const categories = ["Cobertura", "Revitalização", "Correção de linhas", "Ampliação", "Integração", "Releitura"];

const empty: ReformulationItem = {
  id: "",
  order: 1,
  active: true,
  title: "",
  description: "",
  category: categories[0],
  status: "Rascunho",
  beforeImageUrl: "",
  afterImageUrl: "",
  beforeImageKey: "",
  afterImageKey: "",
  beforeVideoUrl: "",
  afterVideoUrl: "",
  beforeVideoKey: "",
  afterVideoKey: "",
  problem: "",
  solution: "",
  internalNote: "",
  imageUrl: "",
  imageKey: "",
};

const patchCard = (cards: ReformulationCard[], id: string, changes: Partial<ReformulationCard>) =>
  cards.map((card) => (card.id === id ? { ...card, ...changes } : card));

const patchPoint = (points: ReformulationPoint[], id: string, changes: Partial<ReformulationPoint>) =>
  points.map((point) => (point.id === id ? { ...point, ...changes } : point));

const TEXT_BLOCKS: DocumentBlock<ReformulationsDocument>[] = [
  {
    id: "hero",
    title: "Hero",
    summary: "Textos e imagem da primeira dobra",
    fields: [
      { key: "heroEyebrow", label: "Texto superior" },
      { key: "heroTitle", label: "Título principal" },
      { key: "heroText", label: "Texto de apoio", type: "textarea", rows: 2, full: true },
      { key: "heroButton", label: "Texto do botão" },
      { key: "heroButtonUrl", label: "Link do botão", type: "internalLink" },
      { key: "heroImageUrl", label: "Imagem de fundo", type: "image", folder: "reformulacoes/hero", compositionHint: true },
    ],
  },
  {
    id: "introducao",
    title: "Introdução",
    summary: "Seção logo abaixo do hero",
    fields: [
      { key: "introEyebrow", label: "Texto superior" },
      { key: "introTitle", label: "Título" },
      { key: "introText", label: "Texto", type: "textarea", rows: 2, full: true },
      { key: "panelEyebrow", label: "Título do painel ao lado" },
      { key: "panelTextOne", label: "Primeiro parágrafo do painel", type: "textarea", rows: 2, full: true },
      { key: "panelTextTwo", label: "Segundo parágrafo do painel", type: "textarea", rows: 2, full: true },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Pontos avaliados</span>
        <div className="ksa-grid-2">
          {[...value.panelPoints]
            .sort((a, b) => a.order - b.order)
            .map((point, index) => (
              <Field label={`${String(index + 1).padStart(2, "0")} · Ponto`} key={point.id}>
                <TextInput
                  value={point.label}
                  onChange={(event) => update({ panelPoints: patchPoint(value.panelPoints, point.id, { label: event.target.value }) })}
                />
              </Field>
            ))}
        </div>
      </div>
    ),
  },
  {
    id: "casos",
    title: "Casos",
    summary: "Textos e cards de antes/depois",
    fields: [
      { key: "portfolioEyebrow", label: "Texto superior" },
      { key: "portfolioTitle", label: "Título" },
      { key: "portfolioText", label: "Texto", type: "textarea", rows: 2, full: true },
      { key: "caseNote", label: "Nota exibida nos casos", type: "textarea", rows: 2, full: true },
    ],
  },
  {
    id: "possibilidades",
    title: "Possibilidades",
    summary: "Última seção antes da faixa final — 3 cards",
    fields: [
      { key: "possibilitiesEyebrow", label: "Texto superior" },
      { key: "possibilitiesTitle", label: "Título" },
      { key: "possibilitiesText", label: "Texto", type: "textarea", rows: 2, full: true },
    ],
    render: (value, update) => (
      <div className="ksa-block-list">
        <span className="ksa-label">Os três cards</span>
        {[...value.possibilityCards]
          .sort((a, b) => a.order - b.order)
          .map((card, index) => (
            <div className="ksa-grid-2" key={card.id}>
              <Field label={`${String(index + 1).padStart(2, "0")} · Título`}>
                <TextInput
                  value={card.title}
                  onChange={(event) => update({ possibilityCards: patchCard(value.possibilityCards, card.id, { title: event.target.value }) })}
                />
              </Field>
              <Field label={`${String(index + 1).padStart(2, "0")} · Descrição`}>
                <TextArea
                  rows={2}
                  value={card.text}
                  onChange={(event) => update({ possibilityCards: patchCard(value.possibilityCards, card.id, { text: event.target.value }) })}
                />
              </Field>
            </div>
          ))}
      </div>
    ),
  },
  {
    id: "cta",
    title: "Chamada final",
    summary: "Convite no fim da página",
    fields: [
      { key: "ctaTitle", label: "Título" },
      { key: "ctaText", label: "Texto", type: "textarea", rows: 2, full: true },
      { key: "ctaButton", label: "Texto do botão" },
      { key: "ctaButtonUrl", label: "Link do botão", type: "internalLink" },
    ],
  },
];

export function ReformulacoesPage() {
  const blocks = useMemo<DocumentBlock<ReformulationsDocument>[]>(() => {
    const casesBlock = TEXT_BLOCKS.find((block) => block.title === "Casos");
    return TEXT_BLOCKS.map((block) => {
      if (block.title !== "Casos" || !casesBlock) return block;

      return {
        ...casesBlock,
        render: () => (
          <div className="ksa-block-list">
            <span className="ksa-label">Casos de reformulação</span>
            <CollectionManager
              config={{
                repository: reformulationsStore,
                singular: "Reformulação",
                collectionKey: "reformulacoes",
                route: "/admin/reformulacoes",
                emptyItem: empty,
                categories,
                image: (item) => item.afterImageUrl || item.beforeImageUrl,
                secondary: (item) => item.solution || item.description || item.category,
                fields: [
                  { key: "beforeImageUrl", label: "1 · Imagem de antes", type: "image", imageKey: "beforeImageKey", folder: "reformulacoes/antes" },
                  { key: "afterImageUrl", label: "2 · Imagem de depois", type: "image", imageKey: "afterImageKey", folder: "reformulacoes/depois" },
                  { key: "beforeVideoUrl", label: "3 · Vídeo de antes", type: "video", imageKey: "beforeVideoKey", folder: "reformulacoes/videos/antes" },
                  { key: "afterVideoUrl", label: "4 · Vídeo de depois", type: "video", imageKey: "afterVideoKey", folder: "reformulacoes/videos/depois" },
                  { key: "title", label: "Título" },
                  { key: "category", label: "Categoria", type: "select", options: categories, allowCustom: true },
                  { key: "problem", label: "Problema inicial", type: "textarea" },
                  { key: "solution", label: "Solução criada", type: "textarea" },
                  { key: "description", label: "Descrição curta", type: "textarea" },
                  { key: "internalNote", label: "Observação interna", type: "textarea", hint: "Não será publicada no site." },
                  { key: "status", label: "Status", type: "select", options: ["Publicado", "Rascunho", "Oculto"] },
                  { key: "active", label: "Caso ativo", type: "toggle" },
                ],
              }}
            />
          </div>
        ),
      };
    });
  }, []);

  return (
    <AdminPage
      eyebrow="Antes e depois"
      title="Reformulações"
      description="Edite os textos da página e os casos de reformulação."
    >
      <VisualDocumentEditor<ReformulationsDocument>
        store={reformulationsTextStore}
        blocks={blocks}
      />
    </AdminPage>
  );
}
