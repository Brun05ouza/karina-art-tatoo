import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseConfig } from "./config.js";

/**
 * Cliente Supabase com inicialização preguiçosa: o servidor sobe sem
 * credenciais de storage e só as exige quando um upload realmente acontece.
 * Sem elas, requireSupabaseConfig lança ConfigError e a resposta é 503.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const config = requireSupabaseConfig();
    client = createClient(config.url, config.serviceRoleKey);
  }
  return client;
}
