-- show_in_recent: aparece em "Trabalhos recentes" da home (default TRUE).
-- featured já existe (006); índice parcial garante um destaque por coleção.

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS show_in_recent BOOLEAN NOT NULL DEFAULT TRUE;
