/** Número do WhatsApp do site — API com fallback para SITE.phone. */

import { useEffect, useState } from "react";
import { SITE } from "./seo";

export const FALLBACK_WHATSAPP_PHONE = SITE.phone.replace(/\D/g, "") || "5521990724477";

let cachedPhone = FALLBACK_WHATSAPP_PHONE;
let loadPromise: Promise<string> | null = null;

export function getWhatsappPhoneSync(): string {
  return cachedPhone;
}

export function whatsappHref(message?: string, phone = cachedPhone): string {
  const digits = (phone || FALLBACK_WHATSAPP_PHONE).replace(/\D/g, "") || FALLBACK_WHATSAPP_PHONE;
  const base = `https://wa.me/${digits}`;
  const text = message?.trim();
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function loadWhatsappPhone(): Promise<string> {
  if (!loadPromise) {
    loadPromise = fetch("/api/settings")
      .then(async (res) => {
        if (!res.ok) return cachedPhone;
        const data = (await res.json()) as { whatsappPhone?: string };
        const digits = String(data.whatsappPhone ?? "").replace(/\D/g, "");
        if (digits) cachedPhone = digits;
        return cachedPhone;
      })
      .catch(() => cachedPhone);
  }
  return loadPromise;
}

/** Prefetch no boot do site público. */
export function prefetchSiteSettings(): void {
  void loadWhatsappPhone();
}

export function useWhatsappPhone(): string {
  const [phone, setPhone] = useState(cachedPhone);
  useEffect(() => {
    void loadWhatsappPhone().then(setPhone);
  }, []);
  return phone;
}

export function formatBrWhatsappDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 13) return `(${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  if (d.length === 12) return `(${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`;
  return d;
}
