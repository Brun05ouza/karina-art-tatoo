-- Coleção reformulações (antes/depois) em gallery_items.

ALTER TABLE gallery_items
  DROP CONSTRAINT IF EXISTS gallery_items_collection_check;

ALTER TABLE gallery_items
  ADD CONSTRAINT gallery_items_collection_check
  CHECK (collection IN ('portfolio', 'flash', 'produtos', 'reformulacoes'));

ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS after_image_url TEXT,
  ADD COLUMN IF NOT EXISTS after_image_key TEXT,
  ADD COLUMN IF NOT EXISTS after_focal_x SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS after_focal_y SMALLINT NOT NULL DEFAULT 50;

ALTER TABLE gallery_items
  DROP CONSTRAINT IF EXISTS gallery_items_after_focal_range;

ALTER TABLE gallery_items
  ADD CONSTRAINT gallery_items_after_focal_range
  CHECK (after_focal_x BETWEEN 0 AND 100 AND after_focal_y BETWEEN 0 AND 100);
