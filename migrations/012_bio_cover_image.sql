-- Capa (bio-cover) editável no perfil da /bio.
ALTER TABLE bio_profile
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_image_key TEXT,
  ADD COLUMN IF NOT EXISTS cover_focal_x SMALLINT NOT NULL DEFAULT 50
    CHECK (cover_focal_x >= 0 AND cover_focal_x <= 100),
  ADD COLUMN IF NOT EXISTS cover_focal_y SMALLINT NOT NULL DEFAULT 50
    CHECK (cover_focal_y >= 0 AND cover_focal_y <= 100);
