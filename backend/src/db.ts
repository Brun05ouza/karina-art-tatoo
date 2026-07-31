import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { requireDatabaseUrl } from "./config.js";

/**
 * Cliente Neon com inicialização preguiçosa.
 *
 * O servidor precisa subir mesmo sem DATABASE_URL (por exemplo, enquanto só a
 * área administrativa está sendo desenvolvida). A conexão só é criada na
 * primeira consulta; se a variável estiver ausente, requireDatabaseUrl lança
 * ConfigError e o error handler responde 503.
 *
 * O shim precisa expor `.query` e `.transaction` porque src/scripts/migrate.ts
 * usa `sql.query(...)` em vez da tagged template.
 */
let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!client) {
    client = neon(requireDatabaseUrl());
  }
  return client;
}

const lazySql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  getClient()(strings, ...values)) as NeonQueryFunction<false, false>;

lazySql.query = ((...args: never[]) => (getClient().query as never as (...a: never[]) => unknown)(...args)) as never;
lazySql.transaction = ((...args: never[]) =>
  (getClient().transaction as never as (...a: never[]) => unknown)(...args)) as never;

export const sql = lazySql;
