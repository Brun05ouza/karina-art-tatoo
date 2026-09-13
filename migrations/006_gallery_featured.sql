ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS gallery_items_one_featured_per_collection
  ON gallery_items (collection) WHERE featured = TRUE;
