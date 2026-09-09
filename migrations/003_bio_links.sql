CREATE TABLE IF NOT EXISTS bio_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      VARCHAR(60) NOT NULL,
  url        TEXT NOT NULL,
  icon       VARCHAR(30),
  featured   BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bio_links_order_idx ON bio_links (published, sort_order);

-- Seed inicial (só se a tabela estiver vazia)
INSERT INTO bio_links (label, url, icon, featured, sort_order, published)
SELECT * FROM (VALUES
  (
    'Solicitar orçamento',
    'https://wa.me/5521990724477?text=Ol%C3%A1%2C%20Karina%20Sarte!%20Vim%20pela%20bio%20do%20site%20e%20queria%20fazer%20um%20or%C3%A7amento.',
    'whatsapp',
    TRUE,
    0,
    TRUE
  ),
  ('TikTok', 'https://www.tiktok.com/@karinasarte', 'tiktok', FALSE, 1, TRUE),
  ('Youtube', 'https://www.youtube.com/@karinasarte', 'youtube', FALSE, 2, TRUE),
  ('Portfólio', '/portfolio', 'portfolio', FALSE, 3, TRUE)
) AS v(label, url, icon, featured, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM bio_links LIMIT 1);
