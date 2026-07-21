// GA4 Ecommerce–compliant dataLayer helpers for GTM/GA4 + persistent lead analytics.
// Purchase é enviado exclusivamente pelo checkout externo — nunca por este site.
// Este arquivo evita duplicações: cada intent gera 1 evento GA4 padrão.

import type { Product } from "@/data/seed";
import { logEventFn, type AnalyticsEventInput } from "@/lib/analytics.functions";

type Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer: Params[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CURRENCY = "BRL";
// Params de atribuição que DEVEM ser preservados no redirecionamento
// para o checkout externo (Google Ads + UTM + Meta).
const ATTRIBUTION_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
] as const;

function ensure(): Params[] {
  if (typeof window === "undefined") return [];
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function getDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function randomId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getLeadId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const key = "oe.lead.v1";
    let v = localStorage.getItem(key);
    if (!v) {
      v = randomId("lead");
      localStorage.setItem(key, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const key = "oe.sid.v1";
    let v = sessionStorage.getItem(key);
    if (!v) {
      v = randomId("sess");
      sessionStorage.setItem(key, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

// Captura + persiste atribuição por lead (UTM, gclid, gbraid, wbraid, fbclid).
// Primeiro toque vence; parâmetros novos na URL SOBRESCREVEM (last-non-null),
// mantendo compatibilidade com Google Ads auto-tagging.
function getAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const storeKey = "oe.attr.v1";
    const url = new URL(window.location.href);
    const stored: Record<string, string> = JSON.parse(
      sessionStorage.getItem(storeKey) || "{}",
    );
    let changed = false;
    for (const k of ATTRIBUTION_KEYS) {
      const v = url.searchParams.get(k);
      if (v && v !== stored[k]) {
        stored[k] = v;
        changed = true;
      }
    }
    if (changed) sessionStorage.setItem(storeKey, JSON.stringify(stored));
    return stored;
  } catch {
    return {};
  }
}

/** Anexa gclid/gbraid/wbraid/utm_x/fbclid ao link externo sem sobrescrever. */
export function appendAttribution(rawUrl: string): string {
  try {
    if (typeof window === "undefined") return rawUrl;
    const attr = getAttribution();
    if (!Object.keys(attr).length) return rawUrl;
    const u = new URL(rawUrl, window.location.origin);
    for (const [k, v] of Object.entries(attr)) {
      if (!v) continue;
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
}

function baseContext(): Params {
  if (typeof window === "undefined") return {};
  const attr = getAttribution();
  return {
    page_url: window.location.href,
    page_location: window.location.href,
    page_title: document.title,
    page_path: window.location.pathname + window.location.search,
    device: getDevice(),
    language: navigator.language,
    referrer: document.referrer || undefined,
    lead_id: getLeadId(),
    session_id: getSessionId(),
    ...attr,
    campaign: attr.utm_campaign,
  };
}

function toJson(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.map(toJson);
  if (typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      const j = toJson(val);
      if (j !== undefined) out[k] = j;
    }
    return out;
  }
  return null;
}

function persist(event: string, ctx: Params, params: Params) {
  if (typeof window === "undefined") return;
  const payload: AnalyticsEventInput = {
    leadId: String(ctx.lead_id ?? getLeadId()),
    sessionId: String(ctx.session_id ?? getSessionId()),
    event,
    pageUrl: typeof ctx.page_url === "string" ? ctx.page_url : window.location.href,
    pagePath: window.location.pathname + window.location.search,
    pageTitle: typeof ctx.page_title === "string" ? ctx.page_title : document.title,
    referrer: typeof ctx.referrer === "string" ? ctx.referrer : undefined,
    device: typeof ctx.device === "string" ? ctx.device : undefined,
    language: typeof ctx.language === "string" ? ctx.language : undefined,
    userAgent: navigator.userAgent,
    utmSource: (ctx.utm_source as string) || undefined,
    utmMedium: (ctx.utm_medium as string) || undefined,
    utmCampaign: (ctx.utm_campaign as string) || undefined,
    productId: (params.product_id as string) || (params.item_id as string) || undefined,
    productName: (params.product_name as string) || (params.item_name as string) || undefined,
    category: (params.category as string) || undefined,
    price: typeof params.price === "number" ? (params.price as number) : undefined,
    affiliateUrl: (params.affiliate_url as string) || undefined,
    placement: (params.placement as string) || undefined,
    params: (toJson(params) as Record<string, never>) ?? {},
  };
  Promise.resolve()
    .then(() => logEventFn({ data: payload }))
    .catch(() => {});
}

/** Push genérico no dataLayer (com contexto padrão e persistência). Também
 *  encaminha via gtag() quando GA4 está carregado — sem isso, GA4 só recebe
 *  eventos automáticos (page_view, session_start, first_visit, user_engagement)
 *  porque dataLayer.push não alimenta gtag diretamente (só GTM ouve). */
export function track(event: string, params: Params = {}) {
  const dl = ensure();
  const ctx = baseContext();
  // GA4 recomenda "limpar" ecommerce anterior antes de eventos ecommerce novos.
  if ("ecommerce" in params) dl.push({ ecommerce: null });
  const payload = { event, ...ctx, ...params };
  dl.push(payload);
  // Envia direto ao GA4 (gtag.js). GTM continua recebendo via dataLayer.
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    const { ecommerce, ...flat } = params as Params & { ecommerce?: unknown };
    const gtagParams: Params = { ...flat };
    if (ecommerce && typeof ecommerce === "object") {
      Object.assign(gtagParams, ecommerce as Params);
    }
    // send_to explícito: quando o GTM também carrega um tag AW- (Ads), o gtag
    // padrão só roteia para o AW-; forçar o ID GA4 garante entrega ao GA4.
    const ga4Id = (window as unknown as { __GA4_ID__?: string }).__GA4_ID__;
    if (ga4Id) gtagParams.send_to = ga4Id;
    try {
      window.gtag("event", event, gtagParams);
    } catch {
      /* noop */
    }
  }
  persist(event, ctx, params);
}

// ---- GA4 Ecommerce items ----

function toItem(p: Product, extra: Params = {}): Params {
  return {
    item_id: p.id,
    item_name: p.name,
    item_category: p.category,
    item_brand: "Shopee",
    price: p.price,
    discount: Math.max(0, p.oldPrice - p.price),
    quantity: 1,
    currency: CURRENCY,
    ...extra,
  };
}

export function trackViewItem(p: Product) {
  track("view_item", {
    ecommerce: {
      currency: CURRENCY,
      value: p.price,
      items: [toItem(p)],
    },
    // Params planos p/ facilitar mapeamento no GTM (evita duplicar eventos):
    product_id: p.id,
    product_name: p.name,
    category: p.category,
    price: p.price,
    affiliate_url: p.affiliateUrl,
  });
}

export function trackViewItemList(list: Product[], listName: string) {
  if (!list.length) return;
  track("view_item_list", {
    ecommerce: {
      item_list_name: listName,
      items: list.slice(0, 20).map((p, i) => toItem(p, { index: i, item_list_name: listName })),
    },
  });
}

export function trackSelectItem(p: Product, listName?: string) {
  track("select_item", {
    ecommerce: {
      item_list_name: listName,
      items: [toItem(p, { item_list_name: listName })],
    },
    product_id: p.id,
    product_name: p.name,
    category: p.category,
    price: p.price,
    affiliate_url: p.affiliateUrl,
  });
}

// ---- begin_checkout — dispara UMA vez por clique no "Comprar" ----
// Guard curto (250ms) evita disparo duplicado do mesmo botão em double-click.
const lastBeginCheckoutAt = new Map<string, number>();

/**
 * Dispara begin_checkout no GA4 (padrão ecommerce) e navega para o afiliado
 * com todos os parâmetros de atribuição preservados (gclid/gbraid/wbraid/utm/fbclid).
 * NÃO envia Purchase — a conversão final fica por conta do checkout externo.
 */
export function trackAffiliateClick(p: Product, placement: string) {
  const now = Date.now();
  const key = `${p.id}:${placement}`;
  const prev = lastBeginCheckoutAt.get(key) ?? 0;
  if (now - prev < 250) return appendAttribution(p.affiliateUrl);
  lastBeginCheckoutAt.set(key, now);

  track("begin_checkout", {
    ecommerce: {
      currency: CURRENCY,
      value: p.price,
      items: [toItem(p)],
    },
    // Params planos úteis para GTM/GA4 exploration:
    product_id: p.id,
    product_name: p.name,
    category: p.category,
    price: p.price,
    placement,
    affiliate_url: p.affiliateUrl,
  });

  return appendAttribution(p.affiliateUrl);
}
