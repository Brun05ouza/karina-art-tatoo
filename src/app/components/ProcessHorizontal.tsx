import { useRef, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    num: "I",
    title: "A Escuta",
    text: "Onde a intenção toma forma antes de virar traço. Uma conversa honesta sobre o que precisa ser marcado.",
  },
  {
    num: "II",
    title: "O Desenho",
    text: "Estudo da anatomia, fluxo do corpo e criação autoral. O freehand ou stencil se adapta à geografia única da pele.",
  },
  {
    num: "III",
    title: "A Pele",
    text: "O rito do encontro entre respiração, foco e tinta. A dor se transforma em permanência.",
  },
  {
    num: "IV",
    title: "A Cura",
    text: "O corpo aceita a nova forma. O desenho assenta, expande e envelhece junto com quem o carrega.",
  },
];

export function ProcessHorizontal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const inView = useInView(titleRef, { once: true });
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Mobile: skip horizontal scroll
    if (window.innerWidth < 768) return;

    const getDistance = () => {
      // track starts after the sidebar, so we add sidebar width to get correct total
      const sidebarW = titleRef.current?.offsetWidth ?? 0;
      return Math.max(0, track.scrollWidth - window.innerWidth + sidebarW);
    };

    const updateSectionHeight = () => {
      const d = getDistance();
      section.style.height = d > 0 ? `calc(100vh + ${d}px)` : "100vh";
    };

    updateSectionHeight();

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          invalidateOnRefresh: true,
          onRefresh: updateSectionHeight,
        },
      });
    }, section);

    const onResize = () => {
      updateSectionHeight();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", onResize);
      if (section) section.style.height = "";
    };
  }, []);

  return (
    <div id="processo">
      {/* Desktop: horizontal scroll via sticky */}
      <section
        ref={sectionRef}
        className="hidden md:block"
        style={{ background: "#131412", position: "relative" }}
      >
        {/* Sticky panel — stays in viewport while section scrolls */}
        <div
          ref={stickyRef}
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Left: title (static) */}
          <div
            ref={titleRef}
            style={{
              flexShrink: 0,
              width: "clamp(220px, 28vw, 380px)",
              padding: "0 clamp(24px, 4vw, 56px)",
              zIndex: 2,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease }}
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 9,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#949087",
                marginBottom: 24,
              }}
            >
              02 — PROCESSO
            </motion.div>

            {["Rito &", "Tempo"].map((word, i) => (
              <div key={word} style={{ overflow: "hidden" }}>
                <motion.div
                  initial={{ y: "100%" }}
                  animate={inView ? { y: 0 } : {}}
                  transition={{ duration: 1.1, delay: 0.2 + i * 0.15, ease }}
                >
                  <div
                    style={{
                      fontFamily: '"Bodoni Moda", serif',
                      fontSize: "clamp(38px, 4.5vw, 62px)",
                      lineHeight: 1.05,
                      fontWeight: 400,
                      color: "#F2EDE2",
                    }}
                  >
                    {word}
                  </div>
                </motion.div>
              </div>
            ))}

            <motion.svg
              width="110"
              height="36"
              viewBox="0 0 110 36"
              fill="none"
              style={{ marginTop: 28 }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <motion.path
                d="M 0 18 Q 27 5 55 18 Q 83 31 110 18"
                stroke="#e9c082"
                strokeWidth="0.75"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.4, delay: 1, ease: "easeInOut" }}
              />
            </motion.svg>
          </div>

          {/* Right: track (translates horizontally via GSAP) */}
          <div
            ref={trackRef}
            style={{
              display: "flex",
              gap: "clamp(16px, 2vw, 28px)",
              paddingRight: "clamp(24px, 5vw, 64px)",
              flexShrink: 0,
              willChange: "transform",
            }}
          >
            {cards.map((card, i) => (
              <ProcessCard key={card.num} card={card} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile: vertical stack */}
      <section
        className="block md:hidden"
        style={{
          background: "#131412",
          padding: "clamp(64px, 12vw, 120px) clamp(24px, 5vw, 40px)",
        }}
      >
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#949087",
            marginBottom: 24,
          }}
        >
          02 — PROCESSO
        </div>
        <div
          style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(38px, 10vw, 56px)",
            lineHeight: 1.05,
            fontWeight: 400,
            color: "#F2EDE2",
            marginBottom: 48,
          }}
        >
          Rito &<br />Tempo
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {cards.map((card, i) => (
            <ProcessCardMobile key={card.num} card={card} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProcessCard({ card, index }: { card: (typeof cards)[0]; index: number }) {
  return (
    <div
      style={{
        width: "clamp(280px, 30vw, 380px)",
        height: "clamp(320px, 50vh, 460px)",
        background: index % 2 === 0 ? "#1b1c1a" : "#1f201e",
        border: "1px solid rgba(242,237,226,0.08)",
        padding: "clamp(28px, 3.5vw, 44px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "#263C86",
          textTransform: "uppercase",
        }}
      >
        {card.num}
      </span>

      <div
        style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: "clamp(20px, 2.2vw, 30px)",
          fontWeight: 400,
          color: "#F2EDE2",
          lineHeight: 1.2,
        }}
      >
        {card.title}
      </div>

      <p
        style={{
          fontFamily: '"Hanken Grotesk", sans-serif',
          fontSize: 13,
          lineHeight: 1.65,
          fontWeight: 300,
          color: "#949087",
          margin: 0,
        }}
      >
        {card.text}
      </p>
    </div>
  );
}

function ProcessCardMobile({ card, index }: { card: (typeof cards)[0]; index: number }) {
  return (
    <div
      style={{
        background: index % 2 === 0 ? "#1b1c1a" : "#1f201e",
        border: "1px solid rgba(242,237,226,0.08)",
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9,
          letterSpacing: "0.18em",
          color: "#263C86",
          textTransform: "uppercase",
        }}
      >
        {card.num}
      </span>
      <div
        style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: 22,
          fontWeight: 400,
          color: "#F2EDE2",
        }}
      >
        {card.title}
      </div>
      <p
        style={{
          fontFamily: '"Hanken Grotesk", sans-serif',
          fontSize: 13,
          lineHeight: 1.65,
          fontWeight: 300,
          color: "#949087",
          margin: 0,
        }}
      >
        {card.text}
      </p>
    </div>
  );
}
