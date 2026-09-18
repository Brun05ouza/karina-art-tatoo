-- Link opcional "Site completo" na /bio (desligado por padrão).
ALTER TABLE bio_profile
  ADD COLUMN IF NOT EXISTS show_site_footer BOOLEAN NOT NULL DEFAULT FALSE;
