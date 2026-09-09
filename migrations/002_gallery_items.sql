CREATE TABLE IF NOT EXISTS gallery_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection  VARCHAR(20) NOT NULL CHECK (collection IN ('portfolio', 'flash', 'produtos')),
  title       VARCHAR(120) NOT NULL,
  category    VARCHAR(60),           -- portfólio
  price       VARCHAR(40),           -- flash e produtos (texto: "a partir de R$ 300")
  link        TEXT,                  -- produtos
  status      VARCHAR(20),           -- flash: 'disponivel' | 'vendido'
  image_url   TEXT NOT NULL,
  image_key   TEXT NOT NULL,         -- caminho no bucket, para poder apagar depois
  alt_text    VARCHAR(200),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  published   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gallery_items_collection_order_idx
  ON gallery_items (collection, published, sort_order);
