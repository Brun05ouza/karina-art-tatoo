-- Rate limit de login.
--
-- Substitui @fastify/rate-limit, que não existe no runtime de Workers. O
-- contador mora no Neon porque ele já está no caminho do login: custo de I/O,
-- zero de CPU (que é o recurso medido no plano gratuito do Pages) e nenhum
-- serviço novo na conta.

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip VARCHAR(64) NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_time_idx
  ON login_attempts (ip, attempted_at DESC);
