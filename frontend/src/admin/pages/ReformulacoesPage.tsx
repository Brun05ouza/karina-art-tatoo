import { useState } from "react";
import { CollectionManager } from "../components/CollectionManager";
import { DocumentEditor, type DocumentBlock } from "../components/DocumentEditor";
import { AdminPage, Field, TextArea, TextInput } from "../components/Primitives";
import { ReformulacoesPreview } from "../components/ReformulacoesPreview";
import { reformulationsStore, reformulationsTextStore } from "../data/stores";
import type { ReformulationCard, ReformulationItem, ReformulationsDocument } from "../data/types";

const categories = ["Cobertura", "Revitalização", "Correção de linhas", "Ampliação", "Integração", "Releitura"];

const empty: ReformulationItem = { id: "", order: 1, active: true, title: "", description: "", category: categories[0], status: "Rascunho", beforeImageUrl: "", afterImageUrl: "", problem: "", solution: "", internalNote: "", imageUrl: "", imageKey: "" };

/** Altera um card mantendo a lista na mesma ordem. */
const patchCard = (cards: ReformulationCard[], id: string, changes: Partial<ReformulationCard>) =>
  cards.map((card) => (card.id === id ? { ...card, ...changes } : card));

/**
 * Três blocos, na ordem das seções publicadas em /reformulacoes:
 * Hero → Introdução → Possibilidades.
 *
 * Os títulos da grade de casos e a faixa final ("Vamos reconstruir…") não têm
 * editor de propósito — são fixos e a prévia os lê direto do documento.
 */
const BLOCKS: DocumentBlock<ReformulationsDocument>[] = [
  {
    title: "Hero",
    summary: "Textos e imagem da primeira dobra",
    fields: [
      { key: "heroEyebrow", label: "Texto superior" },
      { key: "heroTitle", label: "Título principal" },
      { key: "heroText", label: "Texto de apoio", type: "textarea", rows: 3, full: true },
      { key: "heroButton", label: "Texto do botão" },
      { key: "heroButtonUrl", label: "Link do botão" },
      { key: "heroImageUrl", label: "Imagem de fundo", type: "image" },
    ],
  },
  {
    title: "Introdução",
    summary: "Seção logo abaixo do hero — só textos",
    fields: [
      { key: "introEyebrow", label: "Texto superior" },
      { key: "introTitle", label: "Título", type: "textarea", rows: 2 },
      { key: "introText", label: "Texto", type: "textarea", rows: 3, full: true },
      { key: "panelEyebrow", label: "Título do painel ao lado" },
      { key: "panelTextOne", label: "Primeiro parágrafo do painel", type: "textarea", rows: 3, full: true },
      { key: "panelTextTwo", label: "Segundo parágrafo do painel", type: "textarea", rows: 3, full: true },
    ],
  },
  {
    title: "Possibilidades",
    summary: "Última seção antes da faixa final — 3 cards",
    fields: [
      { key: "possibilitiesEyebrow", label: "Texto superior" },
      { key: "possibilitiesTitle", label: "Título" },
      { key: "possibilitiesText", label: "Texto", type: "textarea", rows: 3, full: true },
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
                  rows={3}
                  value={card.text}
                  onChange={(event) => update({ possibilityCards: patchCard(value.possibilityCards, card.id, { text: event.target.value }) })}
                />
              </Field>
            </div>
          ))}
      </div>
    ),
  },
];

/**
 * A tela junta as duas fontes de conteúdo da página: os textos das seções
 * (documento, nos blocos que abrem e fecham) e os casos antes/depois (coleção).
 *
 * Os casos ficam num estado local aqui só para alimentar a prévia — assim uma
 * única prévia mostra o resultado das duas edições ao vivo, em vez de dois
 * iframes desencontrados.
 */
export function ReformulacoesPage() {
  const [casos, setCasos] = useState<ReformulationItem[]>([]);

  return (
    <AdminPage
      eyebrow="Antes e depois"
      title="Reformulações"
      description="Edite os textos das seções e cadastre os casos com o antes e o depois."
    >
      <DocumentEditor<ReformulationsDocument>
        store={reformulationsTextStore}
        blocks={BLOCKS}
        preview={(doc) => <ReformulacoesPreview doc={doc} items={casos} />}
      >
        {() => (
          <div className="ksa-block-list">
            <span className="ksa-label">Casos de reformulação</span>
            <CollectionManager
              config={{
                repository: reformulationsStore,
                singular: "Reformulação",
                emptyItem: empty,
                categories,
                image: (item) => item.afterImageUrl || item.beforeImageUrl,
                secondary: (item) => item.solution || item.description || item.category,
                onPreviewItemsChange: setCasos,
                fields: [
                  { key: "beforeImageUrl", label: "Imagem antes", type: "image", imageKey: "beforeImageKey" },
                  { key: "afterImageUrl", label: "Imagem depois", type: "image", imageKey: "afterImageKey" },
                  { key: "title", label: "Título" },
                  { key: "category", label: "Categoria", type: "select", options: categories },
                  { key: "problem", label: "Problema inicial", type: "textarea" },
                  { key: "solution", label: "Solução criada", type: "textarea" },
                  { key: "description", label: "Descrição curta", type: "textarea" },
                  { key: "internalNote", label: "Observação interna", type: "textarea", hint: "Não será publicada no site." },
                  { key: "status", label: "Status", type: "select", options: ["Publicado", "Rascunho", "Oculto"] },
                  { key: "active", label: "Caso ativo", type: "toggle" },
                  { key: "order", label: "Ordem", type: "number" },
                ],
              }}
            />
          </div>
        )}
      </DocumentEditor>
    </AdminPage>
  );
}
