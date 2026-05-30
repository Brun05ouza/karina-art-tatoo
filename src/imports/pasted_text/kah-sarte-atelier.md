

Crie um protótipo funcional em React/Next.js para o site da artista tatuadora **Kah Sarte**, com estética de **atelier privado, tattoo autoral, ritual, botânica, sumiê, freehand e arte em pele**.

O resultado precisa seguir uma direção visual **editorial, minimalista, dark, contemplativa e premium**, semelhante a um catálogo de galeria de arte ou editorial de moda independente. Não quero uma landing page comercial. Quero uma experiência visual silenciosa, sofisticada, com muito espaço negativo, grid assimétrico, imagens em preto e branco, tipografia serifada forte e microinterações muito bem dosadas.

A referência principal é um site escuro com:
- fundo preto carvão com textura/grain sutil;
- navegação pequena no topo;
- hero minimalista com título grande em serif;
- estrelas pequenas como elementos místicos;
- seções com muito respiro;
- galeria assimétrica, não convencional;
- fotos em P&B com moldura e labels técnicos;
- textos poéticos curtos;
- seção de processo com scroll horizontal ou sticky;
- formulário final elegante e minimalista;
- footer editorial.

---

## 1. Stack obrigatória

Use:

- React ou Next.js
- Tailwind CSS
- Lenis para smooth scroll
- GSAP + ScrollTrigger para animações de scroll, pinning e horizontal scroll
- Framer Motion para reveals, hover states e microinterações
- Anime.js para detalhes pontuais: estrelas, linhas orgânicas, stroke drawing e preloader
- Inspiração de React Bits para SplitText, BlurText, ScrollReveal, AnimatedContent, MagneticButton, TiltedCard
- Inspiração de 21st.dev para componentes premium, botões, cards, cursor, navbar e animações limpas

O site precisa parecer uma experiência, mas sem excesso. As animações devem ser silenciosas, fluidas e caras.

---

## 2. Direção visual

Nome da estética:

**Obsidian & Parchment Tattoo Atelier**

Sensação:

- galeria de arte;
- ritual íntimo;
- editorial de moda dark;
- tattoo autoral;
- botânica mística;
- silêncio, gesto e pele;
- exclusividade sem arrogância.

Evitar completamente:

- visual genérico de tattoo shop;
- caveira, fogo, neon, vermelho agressivo;
- excesso de movimento;
- cards arredondados;
- botões coloridos demais;
- gradientes chamativos;
- estética SaaS/startup;
- landing page comercial padrão.

---

## 3. Paleta de cores

Use os seguintes tokens:

```css
--background: #131412;
--surface: #131412;
--surface-lowest: #0d0e0d;
--surface-low: #1b1c1a;
--surface-container: #1f201e;
--surface-high: #292a29;

--primary: #F2EDE2;
--on-surface: #e4e2e0;
--on-surface-variant: #cac6bc;

--outline: #949087;
--outline-variant: #49473f;

--aged-gold: #e9c082;
--aged-gold-muted: #dab275;

--stencil-blue: #263C86;
--moss: #223529;
--purple: #3A2444;
````

Regras:

* Fundo principal quase sempre preto carvão.
* Texto principal em off-white.
* Dourado envelhecido apenas em estrelas, detalhes e estados especiais.
* Stencil blue somente em marcações técnicas, crosshairs, linhas finas e foco de input.
* Verde musgo apenas em blocos muito específicos ou como profundidade sutil.
* Nada de background chapado: adicionar grain/noise sutil fixo.

---

## 4. Tipografia

Use:

* Títulos: **Bodoni Moda**
* Corpo: **Hanken Grotesk**
* Labels técnicos: **JetBrains Mono**

Escala:

```css
.display-xl {
  font-family: "Bodoni Moda", serif;
  font-size: clamp(56px, 8vw, 112px);
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-weight: 400;
}

.headline-lg {
  font-family: "Bodoni Moda", serif;
  font-size: clamp(40px, 5vw, 72px);
  line-height: 1.05;
  font-weight: 400;
}

.headline-md {
  font-family: "Bodoni Moda", serif;
  font-size: clamp(28px, 3vw, 48px);
  line-height: 1.15;
}

.body-lg {
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 18px;
  line-height: 1.6;
  font-weight: 300;
}

.body-md {
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 15px;
  line-height: 1.65;
  font-weight: 300;
}

.label-caps {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
```

A tipografia deve parecer editorial. Títulos grandes, texto pequeno, labels técnicos. Muito contraste entre escala grande e microtexto.

---

## 5. Shape language

Use cantos retos:

```css
border-radius: 0;
```

Nada de:

* `rounded-xl`
* `rounded-2xl`
* botões pill
* cards SaaS arredondados

Elementos:

* bordas de 1px ou 0.5px;
* molduras tipo passe-partout em imagens;
* linhas horizontais finas;
* crosshair stencil;
* estrelas de 4 ou 8 pontas;
* pequenas coordenadas visuais;
* espaços vazios grandes.

---

## 6. Layout geral

Use uma grid desktop de 12 colunas com margens grandes.

Desktop:

* margem lateral: 64px
* gutter: 32px
* section gap: 160px a 240px
* muitas seções com `min-height: 100vh`
* blocos assimétricos, deslocados por 1–3 colunas
* imagens em tamanhos diferentes

Mobile:

* margem lateral: 24px
* manter estética editorial
* reduzir animações
* transformar horizontal scroll em stack vertical

---

## 7. Componentes necessários

Crie os componentes:

```txt
LenisProvider
Preloader
Header
Hero
Manifesto
EditorialGallery
QuoteDivider
ProcessHorizontal
PrivateAtelier
ArtistSection
BookingForm
Footer
CustomCursor
StarGlyph
StencilCrosshair
RevealText
ImageFrame
MagneticButton
OrganicLine
```

---

## 8. Smooth scroll com Lenis

Configuração desejada:

```ts
const lenis = new Lenis({
  duration: 1.25,
  lerp: 0.075,
  smoothWheel: true,
  wheelMultiplier: 0.85,
  touchMultiplier: 1.2,
});
```

Integrar com GSAP:

```ts
lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

---

## 9. Preloader

Criar uma tela preta com:

* pequena estrela dourada pulsando;
* texto em mono: `KAH SARTE — TATTOO AUTORAL`;
* uma linha orgânica desenhando com Anime.js;
* duração total: 1.5s a 1.8s.

Animação:

* estrela aparece com scale `0.8 → 1`;
* texto entra com opacity e letter spacing;
* linha desenha via `stroke-dashoffset`;
* preloader sai com fade lento.

Não usar loader tecnológico. Deve parecer ritualístico.

---

## 10. Header

Header fixo no topo, minimalista.

Layout:

* esquerda: `KAH SARTE`
* direita: links pequenos:

  * `manifesto`
  * `galeria`
  * `processo`
  * `agendar`

Estilo:

* altura baixa;
* padding lateral grande;
* fundo inicialmente transparente;
* após scroll: backdrop blur muito sutil + linha inferior de 1px com baixa opacidade;
* fonte mono pequena para links;
* logo com Bodoni ou serif pequena.

Hover:

* underline fino animado;
* cor muda para aged-gold;
* cursor customizado aumenta discretamente.

---

## 11. Custom cursor

Desktop apenas.

Estado padrão:

* círculo fino off-white;
* mix-blend-difference;
* 18px.

Em links:

* círculo cresce para 48px;
* baixa opacidade.

Em cards de galeria:

* cresce para 72px;
* mostra texto `VER`.

Em CTA:

* mostra texto `AGENDAR`.

Desativar em touch/mobile.

---

## 12. Hero

Tela inicial full viewport.

Visual:

* fundo preto carvão com grain;
* estrelas pequenas posicionadas em pontos do grid;
* uma foto/vídeo de tattoo muito sutil em background, P&B, opacidade baixa, ou apenas textura escura;
* título grande alinhado à esquerda e abaixo do centro.

Conteúdo:

```txt
TATUAGEM AUTORAL
EM PELE VIVA
```

Label pequeno acima ou abaixo:

```txt
BOTÂNICA · FREEHAND · SUMIÊ — TERESÓPOLIS RJ
```

CTA discreto à direita:

```txt
COMEÇAR UMA IDEIA
```

O CTA deve ser uma borda retangular fina ou apenas texto com linha inferior. Nada de botão chamativo.

Animações:

* título entra por máscara linha a linha;
* label entra depois com blur leve;
* estrela flutua lentamente;
* background faz parallax muito sutil;
* no scroll, hero perde opacidade e o conteúdo sobe levemente.

---

## 13. Manifesto

Seção escura um pouco mais clara:

```css
background: #1b1c1a;
```

Layout:

* label à esquerda: `01 — MANIFESTO`
* texto principal à direita, ocupando 5 ou 6 colunas.

Texto:

```txt
Cada pele pede um desenho.
Cada desenho nasce de escuta, gesto e intenção.
```

Abaixo, texto menor:

```txt
Kah cria tatuagens autorais que atravessam botânica, símbolos, linhas livres e composições feitas para existir com o corpo — não apenas sobre ele.
```

Animação:

* label entra primeiro;
* linha horizontal desenha;
* texto entra palavra por palavra ou linha por linha;
* estrela pequena aparece ao lado do label.

---

## 14. Galeria editorial

Não fazer grid comum. A galeria deve seguir uma composição editorial assimétrica.

Seção:

* fundo preto;
* label central: `COLEÇÕES AUTORAIS`
* título: `GALERIA`
* uma estrela pequena perto do título.

Layout dos itens:

### Item 1 grande — esquerda

Imagem alta, vertical, P&B.

Título:

```txt
BOTÂNICA
```

Texto:

```txt
A natureza interpretada em linhas finas e precisas.
```

Label no frame:

```txt
01 — ATELIER
```

### Item 2 menor — direita, deslocado para baixo

Imagem vertical menor.

Título:

```txt
SUMIÊ
```

Texto:

```txt
O gesto do pincel transformado em tinta na pele.
```

Label:

```txt
02 — GESTO
```

### Quote divider

Entre os blocos, inserir frase central pequena em Bodoni itálico:

```txt
“a assimetria é onde a pele respira.”
```

### Item 3 médio — esquerda deslocado

Título:

```txt
FREEHAND
```

Texto:

```txt
Criações que respeitam a anatomia única de cada corpo.
```

Label:

```txt
03 — FORMA
```

### Item 4 quadrado — direita

Título:

```txt
SÍMBOLOS
```

Texto:

```txt
Pequenas marcações místicas, estrelas e sentidos.
```

Label:

```txt
04 — MÍSTICO
```

### Item 5 opcional

Título:

```txt
FLORAL
```

Texto:

```txt
Delicadeza com presença.
```

Label:

```txt
05 — LINHA
```

Regras das imagens:

* todas em preto e branco por padrão;
* hover libera levemente cor ou aumenta contraste;
* zoom sutil `1.04`;
* moldura com padding interno;
* metadata no canto inferior direito;
* crosshair stencil em alguns cantos;
* borda `1px solid rgba(242,237,226,0.12)`.

Animação:

* cada card entra com fade + y de 48px;
* stagger manual, sem exagero;
* título surge depois da imagem;
* no hover, imagem escala, label aparece e cursor vira `VER`.

---

## 15. Seção de processo — Rito & Tempo

Esta seção deve ser o momento mais interativo.

Criar uma seção com scroll vertical que controla um movimento horizontal, usando GSAP ScrollTrigger.

Estrutura:

* altura: 320vh a 400vh desktop;
* container sticky top 0, height 100vh;
* à esquerda, fixo:

  * label: `02 — PROCESSO`
  * título grande:

```txt
Rito &
Tempo
```

* uma linha orgânica SVG desenhada.

À direita, um track horizontal com cards de processo.

### Card I — A Escuta

```txt
Onde a intenção toma forma antes de virar traço. Uma conversa honesta sobre o que precisa ser marcado.
```

### Card II — O Desenho

```txt
Estudo da anatomia, fluxo do corpo e criação autoral. O freehand ou stencil se adapta à geografia única da pele.
```

### Card III — A Pele

```txt
O rito do encontro entre respiração, foco e tinta. A dor se transforma em permanência.
```

### Card IV — A Cura

```txt
O corpo aceita a nova forma. O desenho assenta, expande e envelhece junto com quem o carrega.
```

Cards:

* retangulares;
* cantos retos;
* fundo em variações de graphite;
* borda fina;
* número romano em mono no topo;
* texto no rodapé;
* altura generosa;
* muito vazio interno.

Scroll behavior:

* o usuário rola verticalmente;
* o track se move horizontalmente;
* o card ativo fica com opacity 1;
* cards não ativos ficam com opacity 0.25;
* título `Rito & Tempo` permanece fixo;
* linha orgânica desenha durante o progresso.

Mobile:

* sem horizontal scroll;
* cards empilhados verticalmente;
* `Rito & Tempo` deixa de ser sticky.

---

## 16. Seção “Ateliê privado”

Criar uma seção muito minimalista com fundo escuro.

Título:

```txt
UM ATELIÊ PRIVADO
PARA DESENHAR COM CALMA
```

Texto:

```txt
Atendimento individual em Teresópolis — RJ, com horário marcado, escuta e processo autoral.
```

Layout:

* texto grande em 6 colunas;
* do outro lado, uma imagem escura do espaço, bancada, stencil ou detalhe de tattoo;
* abaixo, quatro itens em lista com estrela:

```txt
✦ atendimento privado
✦ projeto autoral
✦ freehand e botânica
✦ orientação de cuidados
```

Animação:

* imagem revela por máscara;
* itens aparecem em stagger;
* borda fina desenha no hover.

---

## 17. Seção da artista

Criar apresentação curta, não uma bio longa.

Título:

```txt
A ARTISTA POR TRÁS DO TRAÇO
```

Texto:

```txt
Kah Sarte é artista e tatuadora autoral. Seu trabalho mistura botânica, sumiê, linhas livres e símbolos delicados em composições pensadas para o corpo.
```

Detalhes:

* label: `ELA/DELA`
* localização: `TERESÓPOLIS — RJ`
* link: `@karina.sarte`

Layout:

* retrato P&B dela em frame editorial;
* texto deslocado;
* estrela dourada pequena perto do nome;
* talvez uma linha orgânica passando atrás.

---

## 18. BookingForm — O Início de uma Ideia

Seção final em `surface-lowest`.

Título central:

```txt
O Início de uma Ideia
```

Subtexto:

```txt
Compartilhe sua intenção, região do corpo e o que a tatuagem precisa carregar.
```

Criar formulário em 3 etapas, elegante.

### Etapa 1 — Contato

Campos:

* Nome completo
* E-mail
* Telefone

### Etapa 2 — Disponibilidade

Opções:

* este mês
* próximo mês
* flexível
* data específica

Campo:

* detalhes de disponibilidade

### Etapa 3 — Ideia

Textarea:

* sua ideia, símbolos, referências e região do corpo

Visual do formulário:

* container escuro;
* borda fina;
* cantos retos;
* crosshair stencil nos quatro cantos;
* indicadores de etapa com pequenos pontos;
* inputs apenas com linha inferior;
* label flutuante;
* foco em stencil blue ou aged-gold;
* botão final em off-white com texto preto, mas discreto.

Botões:

* `VOLTAR`
* `PRÓXIMO`
* `ENVIAR INTENÇÃO`

Ao enviar:

* não precisa enviar de verdade;
* mostrar estado de sucesso:

```txt
intenção recebida.
a conversa continua pelo WhatsApp.
```

---

## 19. Footer

Footer minimalista.

Esquerda:

```txt
KAH SARTE
```

Centro:

```txt
© 2026 KAH SARTE — TATUAGEM AUTORAL
```

Direita:

```txt
INSTAGRAM
WHATSAPP
EMAIL
```

Borda superior fina.
Muito padding.
Texto pequeno.

---

## 20. Animações detalhadas

### ScrollReveal

Usar para:

* seções;
* imagens;
* títulos;
* labels;
* cards.

Configuração:

```txt
y: 48
opacity: 0 → 1
duration: 1.1s
ease: cubic-bezier(0.22, 1, 0.36, 1)
```

### SplitText

Usar no hero e títulos grandes.
Revelar linha por linha com máscara vertical.

### Horizontal scroll

Usar GSAP ScrollTrigger:

```ts
const section = document.querySelector(".process-section");
const track = document.querySelector(".process-track");

gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: section,
    start: "top top",
    end: () => `+=${track.scrollWidth}`,
    scrub: 1,
    pin: true,
    anticipatePin: 1,
  },
});
```

### Parallax

Muito sutil:

* hero image: `translateY 10–15%`;
* algumas imagens da galeria: `translateY -24px`;
* estrelas: movimento lento independente.

### Anime.js

Usar somente para:

* preloader;
* stroke-dashoffset de linhas orgânicas;
* pequena pulsação de estrelas;
* microanimação de crosshair.

Nada de animação espalhafatosa.

---

## 21. Acessibilidade e performance

* respeitar `prefers-reduced-motion`;
* lazy load nas imagens;
* contraste alto;
* navegação por teclado;
* labels reais nos inputs;
* não usar autoplay com som;
* não travar scroll;
* animações devem ter fallback simples;
* mobile deve ficar leve.

---

## 22. Copy final do site

### Hero

```txt
KAH SARTE

TATUAGEM AUTORAL
EM PELE VIVA

BOTÂNICA · FREEHAND · SUMIÊ — TERESÓPOLIS RJ

COMEÇAR UMA IDEIA
```

### Manifesto

```txt
Cada pele pede um desenho.
Cada desenho nasce de escuta, gesto e intenção.

Kah cria tatuagens autorais que atravessam botânica, símbolos, linhas livres e composições feitas para existir com o corpo — não apenas sobre ele.
```

### Galeria

```txt
COLEÇÕES AUTORAIS
GALERIA
```

Cards:

```txt
BOTÂNICA
A natureza interpretada em linhas finas e precisas.

SUMIÊ
O gesto do pincel transformado em tinta na pele.

FREEHAND
Criações que respeitam a anatomia única de cada corpo.

SÍMBOLOS
Pequenas marcações místicas, estrelas e sentidos.
```

Quote:

```txt
“a assimetria é onde a pele respira.”
```

### Processo

```txt
Rito & Tempo
```

Etapas:

```txt
A Escuta
Onde a intenção toma forma antes de virar traço. Uma conversa honesta sobre o que precisa ser marcado.

O Desenho
Estudo da anatomia, fluxo do corpo e criação autoral. O freehand ou stencil se adapta à geografia única da pele.

A Pele
O rito do encontro entre respiração, foco e tinta. A dor se transforma em permanência.

A Cura
O corpo aceita a nova forma. O desenho assenta, expande e envelhece junto com quem o carrega.
```

### Ateliê

```txt
Um ateliê privado para desenhar com calma.

Atendimento individual em Teresópolis — RJ, com horário marcado, escuta e processo autoral.
```

### Artista

```txt
A artista por trás do traço.

Kah Sarte é artista e tatuadora autoral. Seu trabalho mistura botânica, sumiê, linhas livres e símbolos delicados em composições pensadas para o corpo.
```

### Agendamento

```txt
O Início de uma Ideia

Compartilhe sua intenção, região do corpo e o que a tatuagem precisa carregar.
```

---

## 23. Resultado esperado

O resultado precisa parecer caro, artístico e silencioso.

Deve ter:

* hero escuro e minimalista;
* tipografia Bodoni forte;
* navegação pequena;
* galeria editorial assimétrica;
* fotos em P&B com molduras finas;
* processo em horizontal scroll;
* seção final com formulário elegante;
* uso discreto de estrelas, crosshair e stencil blue;
* animações suaves com Lenis, GSAP, Framer Motion e Anime.js;
* nenhum elemento com aparência genérica de template.

O site deve transmitir:

**tattoo autoral, pele, ritual, botânica, silêncio, precisão e arte.**

