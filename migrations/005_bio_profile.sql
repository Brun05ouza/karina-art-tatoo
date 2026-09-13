-- Bio profile CMS: perfil (single-row), chips de estilo e depoimentos.

CREATE TABLE IF NOT EXISTS bio_profile (
  id                 INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  avatar_url         TEXT NOT NULL,
  avatar_key         TEXT,
  subtitle           VARCHAR(80) NOT NULL,
  studio_image_url   TEXT NOT NULL,
  studio_image_key   TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO bio_profile (id, avatar_url, avatar_key, subtitle, studio_image_url, studio_image_key)
VALUES (
  1,
  '/assets/karina-sarte.png',
  NULL,
  'Tatuagem autoral · Teresópolis, RJ',
  '/assets/studio/studio-5.jpeg',
  NULL
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS bio_style_chips (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      VARCHAR(30) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bio_style_chips_order_idx ON bio_style_chips (sort_order);

INSERT INTO bio_style_chips (label, sort_order)
SELECT * FROM (VALUES
  ('blackwork', 0),
  ('botânica', 1),
  ('ornamental', 2),
  ('suminagashi', 3),
  ('fineline', 4),
  ('neotradicional', 5)
) AS v(label, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM bio_style_chips LIMIT 1);

CREATE TABLE IF NOT EXISTS bio_testimonials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote      VARCHAR(280) NOT NULL,
  author     VARCHAR(60),
  sort_order INTEGER NOT NULL DEFAULT 0,
  published  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bio_testimonials_order_idx
  ON bio_testimonials (published, sort_order);

INSERT INTO bio_testimonials (quote, author, sort_order, published)
SELECT * FROM (VALUES
  ('Ficou simplesmente perfeita!', NULL::varchar, 0, TRUE),
  ('Me senti ouvida em cada detalhe.', NULL::varchar, 1, TRUE),
  ('Melhor que eu esperava.', NULL::varchar, 2, TRUE),
  ('O trabalho ficou surreal.', NULL::varchar, 3, TRUE)
) AS v(quote, author, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM bio_testimonials LIMIT 1);
