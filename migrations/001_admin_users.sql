CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                VARCHAR(200) NOT NULL UNIQUE,
  password_hash        TEXT NOT NULL,
  role                 VARCHAR(20) NOT NULL DEFAULT 'editor',
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_users_active_email_idx ON admin_users (active, email);

-- Rate limit de login. Fica no Neon porque o banco já está no caminho da requisição:
-- custo de I/O, zero de CPU (o recurso medido no plano gratuito).
CREATE TABLE IF NOT EXISTS login_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        VARCHAR(200),
  ip           VARCHAR(64) NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_time_idx ON login_attempts (ip, attempted_at DESC);
CREATE INDEX IF NOT EXISTS login_attempts_email_time_idx ON login_attempts (email, attempted_at DESC);
