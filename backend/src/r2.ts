import { S3Client } from "@aws-sdk/client-s3";
import { requireR2Config } from "./config.js";

/**
 * Cliente R2 com inicialização preguiçosa: o servidor sobe sem credenciais de
 * storage e só as exige quando um upload realmente acontece. Sem elas,
 * requireR2Config lança ConfigError e a resposta é 503.
 */
let client: S3Client | null = null;

export function getR2(): S3Client {
  if (!client) {
    const config = requireR2Config();
    client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return client;
}
