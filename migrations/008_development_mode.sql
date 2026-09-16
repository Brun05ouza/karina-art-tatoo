-- site_settings é key/value (não uma linha com colunas).
-- O interruptor vive na chave development_mode, valor "true" | "false".
-- true agora: o site ainda não foi lançado. No lançamento, gravar "false".

INSERT INTO site_settings (key, value)
VALUES ('development_mode', 'true')
ON CONFLICT (key) DO NOTHING;
