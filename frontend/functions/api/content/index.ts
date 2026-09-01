import { handleError, json, type Env } from "../../_lib/config";
import { getSql } from "../../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const sql = getSql(env);
    const rows = await sql`
      SELECT key, value, updated_at AS "updatedAt"
      FROM content_entries
      WHERE published = true
      ORDER BY key ASC
    `;

    return json({ items: rows });
  } catch (cause) {
    return handleError(cause);
  }
};
