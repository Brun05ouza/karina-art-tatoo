-- Bio links: kind (whatsapp | external | internal) + message; site_settings (WhatsApp único).

CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value)
VALUES ('whatsapp_phone', '5521990724477')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE bio_links
  ADD COLUMN IF NOT EXISTS kind VARCHAR(20) NOT NULL DEFAULT 'external';

ALTER TABLE bio_links
  ADD COLUMN IF NOT EXISTS message TEXT;

-- Decodifica percent-encoding (%XX) preservando UTF-8 (acentos/emoji).
CREATE OR REPLACE FUNCTION bio_url_decode(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $fn$
DECLARE
  src text := replace(coalesce(input, ''), '+', ' ');
  out_text text := '';
  pos int := 1;
  ch text;
  hexpair text;
  buf bytea := '\x'::bytea;
BEGIN
  WHILE pos <= length(src) LOOP
    ch := substr(src, pos, 1);
    IF ch = '%' AND pos + 2 <= length(src)
       AND substr(src, pos + 1, 2) ~ '^[0-9A-Fa-f]{2}$' THEN
      hexpair := substr(src, pos + 1, 2);
      buf := buf || decode(upper(hexpair), 'hex');
      pos := pos + 3;
    ELSE
      IF length(buf) > 0 THEN
        out_text := out_text || convert_from(buf, 'UTF8');
        buf := '\x'::bytea;
      END IF;
      out_text := out_text || ch;
      pos := pos + 1;
    END IF;
  END LOOP;
  IF length(buf) > 0 THEN
    out_text := out_text || convert_from(buf, 'UTF8');
  END IF;
  RETURN out_text;
END;
$fn$;

-- WhatsApp: kind + mensagem decodificada; limpa url (montada no GET)
UPDATE bio_links
SET
  kind = 'whatsapp',
  message = NULLIF(
    bio_url_decode((regexp_match(url, '[?&]text=([^&]*)'))[1]),
    ''
  ),
  url = '',
  updated_at = NOW()
WHERE url ~* 'wa\.me'
  AND kind = 'external';

-- Caminhos relativos do site
UPDATE bio_links
SET
  kind = 'internal',
  updated_at = NOW()
WHERE url LIKE '/%'
  AND url NOT LIKE '//%'
  AND kind = 'external';

DROP FUNCTION IF EXISTS bio_url_decode(text);
