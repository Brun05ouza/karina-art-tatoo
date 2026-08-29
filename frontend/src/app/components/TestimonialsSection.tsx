import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { BrandStar } from "./BrandStar";
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

function buildColumns(items: Testimonial[], columns: number): Testimonial[][] {
  const count = Math.max(columns, 1);
  const perColumn = Math.max(4, Math.ceil(items.length / count));
  return Array.from({ length: count }, (_, columnIndex) => {
    const column: Testimonial[] = [];
    for (let i = 0; i < perColumn; i += 1) {
      column.push(items[(columnIndex + i * count) % items.length]);
    }
    return column;
  });
}

export function TestimonialsSection() {
  return (
    <section className="ks-testimonials" aria-labelledby="ks-testimonials-title">
      <div className="ks-testimonials-grain" aria-hidden="true" />
      <div className="ks-testimonials-glow" aria-hidden="true" />
      <BrandStar variant={2} size={280} className="ks-testimonials-deco ks-testimonials-deco-a" />
      <BrandStar variant={3} size={150} className="ks-testimonials-deco ks-testimonials-deco-b" />
      <BrandStar variant={2} size={64} className="ks-testimonials-deco ks-testimonials-deco-c" />

      <div className="ks-testimonials-inner">
        <motion.div
          className="ks-testimonials-copy"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <span className="ks-label-caps ks-testimonials-label">Depoimentos</span>
          <h2 id="ks-testimonials-title">
            O que falam depois
            <br />
            que a arte vai pra pele.
          </h2>
          <p className="ks-testimonials-lead">
            Algumas mensagens de quem já passou pelo processo comigo — entre ideias, ajustes, cuidado e
            aquele friozinho bom de ver a tattoo pronta.
          </p>
          <GuardedLink className="ks-primary-link special ks-testimonials-cta" to="/orcamento" data-cursor="cta">
            Quero viver essa experiência também
            <ArrowRight size={16} />
          </GuardedLink>
        </motion.div>

        <TestimonialsCardDrift items={TESTIMONIALS} />
      </div>
    </section>
  );
}

function TestimonialsCardDrift({ items }: { items: Testimonial[] }) {
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const columns = useMemo(() => buildColumns(items, 2), [items]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;

    const offsets = columns.map((_, index) => index * 40);
    const speeds = columns.map((_, index) => 22 * (index % 2 === 0 ? 1 : 0.86));
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      trackRefs.current.forEach((track, index) => {
        if (!track) return;
        const half = track.scrollHeight / 2;
        if (half <= 0) return;
        offsets[index] = (offsets[index] + speeds[index] * dt) % half;
        const goesUp = index % 2 === 0;
        const y = goesUp ? -offsets[index] : offsets[index] - half;
        track.style.transform = `translate3d(0, ${y}px, 0)`;
      });

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [columns, reducedMotion]);

  return (
    <div className="ks-testimonials-featured" aria-label="Depoimentos em movimento">
      <div className="ks-testimonials-featured-fade ks-testimonials-featured-fade-top" aria-hidden="true" />
      <div className="ks-testimonials-featured-fade ks-testimonials-featured-fade-bottom" aria-hidden="true" />
      {columns.map((column, columnIndex) => {
        const loop = [...column, ...column];
        return (
          <div key={`col-${columnIndex}`} className="ks-testimonials-featured-col">
            <div
              ref={(node) => {
                trackRefs.current[columnIndex] = node;
              }}
              className="ks-testimonials-featured-track"
            >
              {loop.map((item, itemIndex) => (
                <TestimonialCard
                  key={`${columnIndex}-${itemIndex}-${item.id}`}
                  item={item}
                  motionEnabled={false}
                  style={{ marginBottom: 14 }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TestimonialCard({
  item,
  motionEnabled = true,
  style,
}: {
  item: Testimonial;
  motionEnabled?: boolean;
  style?: CSSProperties;
}) {
  const className = `ks-testimonial-card${item.size ? ` is-${item.size}` : ""}`;
  const cardStyle: CSSProperties = {
    ...(item.rotate ? ({ "--ks-card-rotate": `${item.rotate}deg` } as CSSProperties) : {}),
    ...style,
  };

  const body = (
    <>
      <StarGlyph size={14} color="#806E85" className="ks-testimonial-card-star" />
      <blockquote>
        <p>“{item.quote}”</p>
      </blockquote>
      <footer>
        <span className="ks-testimonial-card-from">Mensagem recebida</span>
        <span className="ks-testimonial-card-tag">{item.tag}</span>
      </footer>
    </>
  );

  if (!motionEnabled) {
    return (
      <article className={className} style={cardStyle}>
        {body}
      </article>
    );
  }

  return (
    <motion.article
      className={className}
      style={cardStyle}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
      }}
    >
      {body}
    </motion.article>
  );
}

