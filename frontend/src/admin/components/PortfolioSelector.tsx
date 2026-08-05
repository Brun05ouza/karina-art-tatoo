import { ImagePlus } from "lucide-react";
import { useCollection } from "../hooks/useCollection";
import { portfolioStore } from "../data/stores";

type Props = {
  selectedIds: string[];
  onChange(ids: string[]): void;
};

/**
 * Exibido dentro do bloco "Portfólio" da Home quando o modo é "manual".
 * Mostra todos os itens do portfólio como cards clicáveis e permite marcar
 * quais deles aparecem na seção de portfólio da página inicial.
 */
export function PortfolioSelector({ selectedIds, onChange }: Props) {
  const { items, loading } = useCollection(portfolioStore);

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((current) => current !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  if (loading) {
    return (
      <div className="ksa-portfolio-selector">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ksa-portfolio-selector-card is-skeleton" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="ksa-muted">
        Nenhum trabalho cadastrado no Portfólio. Adicione itens na seção{" "}
        <strong>Portfólio</strong> para selecioná-los aqui.
      </p>
    );
  }

  return (
    <div className="ksa-portfolio-selector">
      {[...items]
        .sort((a, b) => a.order - b.order)
        .map((item) => {
          const selected = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`ksa-portfolio-selector-card ${selected ? "is-selected" : ""}`}
              onClick={() => toggle(item.id)}
              aria-pressed={selected}
              title={selected ? "Remover da home" : "Adicionar à home"}
            >
              <div className="ksa-portfolio-selector-thumb">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <span className="ksa-portfolio-selector-placeholder">
                    <ImagePlus size={20} />
                  </span>
                )}
              </div>
              <div className="ksa-portfolio-selector-info">
                <strong>{item.title}</strong>
                {item.category && <small>{item.category}</small>}
              </div>
              <div className="ksa-portfolio-selector-check" aria-hidden="true">
                {selected ? "✓" : ""}
              </div>
            </button>
          );
        })}
    </div>
  );
}
