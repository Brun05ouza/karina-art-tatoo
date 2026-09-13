ALTER TABLE gallery_items
  ADD COLUMN IF NOT EXISTS focal_x SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS focal_y SMALLINT NOT NULL DEFAULT 50;

ALTER TABLE gallery_items
  DROP CONSTRAINT IF EXISTS gallery_items_focal_range;

ALTER TABLE gallery_items
  ADD CONSTRAINT gallery_items_focal_range
  CHECK (focal_x BETWEEN 0 AND 100 AND focal_y BETWEEN 0 AND 100);

ALTER TABLE bio_profile
  ADD COLUMN IF NOT EXISTS avatar_focal_x SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS avatar_focal_y SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS studio_focal_x SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS studio_focal_y SMALLINT NOT NULL DEFAULT 50;

ALTER TABLE bio_profile
  DROP CONSTRAINT IF EXISTS bio_profile_avatar_focal_range;

ALTER TABLE bio_profile
  ADD CONSTRAINT bio_profile_avatar_focal_range
  CHECK (
    avatar_focal_x BETWEEN 0 AND 100
    AND avatar_focal_y BETWEEN 0 AND 100
  );

ALTER TABLE bio_profile
  DROP CONSTRAINT IF EXISTS bio_profile_studio_focal_range;

ALTER TABLE bio_profile
  ADD CONSTRAINT bio_profile_studio_focal_range
  CHECK (
    studio_focal_x BETWEEN 0 AND 100
    AND studio_focal_y BETWEEN 0 AND 100
  );
