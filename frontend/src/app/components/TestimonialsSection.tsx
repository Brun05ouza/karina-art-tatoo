import { useRef, useState, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { GuardedLink } from "./ComingSoonModal";
import { StarGlyph } from "./StarGlyph";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Testimonial = {
  id: string;
  quote: string;
  tag: string;
  size?: "lg" | "md" | "sm";
  rotate?: number;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t9",
    quote: "Me senti ouvida em cada detalhe que pedia. Eu adorei muito o resultado.",
    tag: "experiência",
    size: "lg",
    rotate: 1.2,
  },
  {
    id: "t5",
    quote: "Ficou simplesmente perfeita!",
    tag: "projeto autoral",
    size: "sm",
    rotate: -2.2,
  },
  {
    id: "t11",
    quote: "O trabalho ficou surreal. Conseguiu trazer o simbolismo e significado real delas.",
    tag: "projeto autoral",
    size: "md",
    rotate: 2.0,
  },
  {
    id: "t2",
    quote: "Maravilhoso. Tô apaixonado.",
    tag: "experiência",
    size: "sm",
    rotate: 1.8,
  },
  {
    id: "t3",
    quote: "Sim, todo mundo tá elogiando muito. E eu amei.",
    tag: "flash tattoo",
    size: "sm",
    rotate: -0.8,
  },
  {
    id: "t4",
    quote: "Eu tô apaixonada demais, você arrasa muito!",
    tag: "experiência",
    size: "sm",
    rotate: 2.1,
  },
  {
    id: "t7",
    quote: "Ficou maravilhosa. Melhor que eu esperava. Melhor que o original.",
    tag: "reformulação",
    size: "md",
    rotate: -1.6,
  },
  {
    id: "t1",
    quote:
      "Você é uma profissional muito foda! Obrigada pelo trabalho incrível e por representar algo tão importante para mim em forma de arte.",
    tag: "projeto autoral",
    size: "md",
    rotate: -1.4,
  },
  {
    id: "t6",
    quote:
      "Amei tudo! Pela paciência, profissionalismo e alto astral. A melhor primeira experiência possível.",
    tag: "primeira tattoo",
    size: "md",
    rotate: 1.2,
  },
  {
    id: "t8",
    quote:
      "Eu amei demais! Todo o cuidado e carinho conosco, além da compreensão da demora das frases.",
    tag: "experiência",
    size: "md",
    rotate: 0.9,
  },
  {
    id: "t10",
    quote: "Ficou tão linda, eu tô apaixonada nela. Muito obrigada mesmo pelo trabalho impecável.",
    tag: "projeto autoral",
    size: "md",
    rotate: -1.1,
  },
];

export function TestimonialsSection() {
  const reducedMotion = useReducedMotion();
  return (
    <section className="ks-testimonials" aria-labelledby="ks-testimonials-title">
      <div className="ks-testimonials-grain" aria-hidden="true" />
      <div className="ks-testimonials-glow" aria-hidden="true" />

      <div className="ks-testimonials-inner">
        <motion.div
          className="ks-testimonials-copy"
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <span className="ks-label-caps ks-testimonials-label">Depoimentos</span>
          <h2 id="ks-testimonials-title">
            A arte fica.<br /><span>O carinho também.</span>
          </h2>
          <p className="ks-testimonials-lead">
            Da primeira ideia ao espelho: cada tattoo tem uma história. E essas são algumas das mensagens que ficam comigo depois da sessão.
          </p>
          <GuardedLink className="ks-primary-link special ks-testimonials-cta" to="/orcamento" data-cursor="cta">
            Vamos criar a sua?
            <ArrowRight size={16} />
          </GuardedLink>
          <span className="ks-testimonials-signoff">Feito na pele. Guardado com carinho.</span>
        </motion.div>

        <TestimonialsCardDrift items={TESTIMONIALS} />
      </div>
    </section>
  );
}

function TestimonialsCardDrift({ items }: { items: Testimonial[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const [paused, setPaused] = useState(false);
  const columns = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1), items];
  return (
    <div className="ks-testimonials-mural" ref={ref}>
      <div className="ks-testimonials-mural-heading">
        <span>Palavras que ficam</span>
        <button type="button" className="ks-testimonials-pause" aria-pressed={paused}
          aria-label={paused ? "Retomar movimento dos depoimentos" : "Pausar movimento dos depoimentos"}
          onClick={() => setPaused(!paused)}>
          {paused ? <Play size={12} /> : <Pause size={12} />}{paused ? "Continuar" : "Pausar"}
        </button>
      </div>
      <div className="ks-testimonials-featured" aria-label="Mensagens de clientes" data-paused={paused || !inView}>
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="ks-testimonials-featured-col">
            <div className="ks-testimonials-featured-track">
              {[0, 1].map(copy => (
                <div className="ks-testimonials-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                  {column.map(item => <TestimonialCard key={item.id} item={item} />)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className={`ks-testimonial-card is-${item.size ?? "md"}`}
      style={{ "--ks-card-rotate": `${(item.rotate ?? 0) * 0.45}deg` } as CSSProperties}>
      <div className="ks-testimonial-card-heading">
        <span className="ks-testimonial-card-tag">{item.tag}</span>
        <StarGlyph size={19} color="currentColor" className="ks-testimonial-card-star" />
      </div>
      <blockquote><p>“{item.quote}”</p></blockquote>
      <footer><span className="ks-testimonial-card-from">Depois da sessão</span><span aria-hidden="true">↗</span></footer>
    </article>
  );
}
