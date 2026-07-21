// Edge Function "api" — executa TODAS as operações privilegiadas no Lovable Cloud.
// Chamada pelo frontend/Vercel via HTTPS. A SUPABASE_SERVICE_ROLE_KEY vive apenas aqui.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import QRCode from "npm:qrcode@1.5.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_PASSWORD_ENV = Deno.env.get("SITE_PASSWORD") ?? "";
const STREETPAYS_ENV_KEY = Deno.env.get("STREETPAYS_API_KEY") ?? "";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------- CORS ----------
const ALLOWED_ORIGINS = new Set(
  (Deno.env.get("ALLOWED_ORIGINS") ??
    "https://guardian-reborn.vercel.app,https://guardian-reborn.lovable.app,http://localhost:8080,http://localhost:5173")
    .split(",").map((s) => s.trim()).filter(Boolean),
);
function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
function json(body: unknown, init: ResponseInit & { headers?: Record<string, string> } = {}, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...cors(origin), ...(init.headers ?? {}) },
  });
}

// ---------- Password (timing-safe) ----------
async function sha256(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return new Uint8Array(h);
}
async function verifyPassword(pw: string) {
  if (!SITE_PASSWORD_ENV) return { ok: false as const, message: "SITE_PASSWORD não configurado" };
  const a = await sha256(pw ?? "");
  const b = await sha256(SITE_PASSWORD_ENV);
  if (a.length !== b.length) return { ok: false as const, message: "Senha do admin incorreta." };
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0 ? { ok: true as const } : { ok: false as const, message: "Senha do admin incorreta." };
}

// ---------- Helpers ----------
function digits(s: string) { return (s || "").replace(/\D/g, ""); }
function pickString(obj: unknown, paths: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const path of paths) {
    const parts = path.split(".");
    let cur: any = obj;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else { cur = undefined; break; }
    }
    if (typeof cur === "string" && cur.length > 0) return cur;
    if (typeof cur === "number") return String(cur);
  }
  return null;
}
async function getGatewayApiKey(): Promise<string> {
  if (STREETPAYS_ENV_KEY.trim()) return STREETPAYS_ENV_KEY.trim();
  const { data } = await admin.from("site_settings").select("streetpays_api_key").eq("id", "default").maybeSingle();
  return ((data as any)?.streetpays_api_key ?? "").toString().trim();
}
function sanitizePrefix(v: string) {
  return (v || "").toLowerCase().replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9-_]/g, "");
}

// ---------- Actions ----------
type Ctx = { origin: string | null };

async function requireAuth(payload: any) {
  const r = await verifyPassword(payload?.password ?? "");
  return r;
}

async function dispatch(action: string, payload: any, ctx: Ctx): Promise<any> {
  switch (action) {
    // ============ AUTH ============
    case "admin.verifyPassword": {
      const r = await verifyPassword(payload?.password ?? "");
      return { ok: r.ok };
    }

    // ============ SETTINGS (public read) ============
    case "public.getSettings": {
      const { data } = await admin.from("site_settings").select("*").eq("id", "default").maybeSingle();
      const row: any = data ?? {};
      return {
        gtmId: row.gtm_id ?? "",
        ga4Id: row.ga4_id ?? "",
        headScript: row.head_script ?? "",
        bodyStartScript: row.body_start_script ?? "",
        bodyEndScript: row.body_end_script ?? "",
        pathPrefix: row.path_prefix ?? "produto",
      };
    }
    case "admin.upsertSettings": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const s = payload.settings;
      const prefix = sanitizePrefix(s.pathPrefix || "produto") || "produto";
      const { error } = await admin.from("site_settings").upsert({
        id: "default",
        gtm_id: s.gtmId || null,
        ga4_id: s.ga4Id || null,
        head_script: s.headScript || null,
        body_start_script: s.bodyStartScript || null,
        body_end_script: s.bodyEndScript || null,
        path_prefix: prefix,
        updated_at: new Date().toISOString(),
      });
      return error ? { ok: false, message: error.message } : { ok: true };
    }
    case "admin.getGateway": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { data } = await admin.from("site_settings").select("streetpays_api_key").eq("id", "default").maybeSingle();
      return {
        ok: true,
        streetpaysApiKey: ((data as any)?.streetpays_api_key ?? "") as string,
        hasEnvFallback: !!STREETPAYS_ENV_KEY,
      };
    }
    case "admin.upsertGateway": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const key = (payload.streetpaysApiKey || "").trim();
      const { error } = await admin.from("site_settings").upsert({
        id: "default",
        streetpays_api_key: key || null,
        updated_at: new Date().toISOString(),
      });
      return error ? { ok: false, message: error.message } : { ok: true };
    }

    // ============ PRODUCTS ============
    case "admin.upsertProduct": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const p = payload.product;
      const row = {
        id: p.id, slug: p.slug ?? null, name: p.name, description: p.description ?? null,
        image: p.image ?? "", category: p.category, old_price: p.oldPrice, price: p.price,
        sold: p.sold, rating: p.rating, affiliate_url: p.affiliateUrl, badges: p.badges,
        coupon_text: p.couponText ?? null, active: p.active, order: p.order,
      };
      const { error } = await admin.from("products").upsert(row);
      return error ? { ok: false, message: error.message } : { ok: true };
    }
    case "admin.deleteProduct": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { error } = await admin.from("products").delete().eq("id", payload.id);
      return error ? { ok: false, message: error.message } : { ok: true };
    }
    case "admin.reorderProducts": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      for (let i = 0; i < payload.ids.length; i++) {
        const { error } = await admin.from("products").update({ order: i }).eq("id", payload.ids[i]);
        if (error) return { ok: false, message: error.message };
      }
      return { ok: true };
    }

    // ============ ORDERS ============
    case "admin.listOrders": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { data, error } = await admin.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
      return error ? { ok: false, message: error.message } : { ok: true, orders: data ?? [] };
    }
    case "admin.updateOrderStatus": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { error } = await admin.from("orders").update({ status: payload.status }).eq("id", payload.id);
      return error ? { ok: false, message: error.message } : { ok: true };
    }

    // ============ COUPONS ============
    case "admin.listCoupons": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { data, error } = await admin.from("coupons").select("*").order("created_at", { ascending: false });
      return error ? { ok: false, message: error.message } : { ok: true, coupons: data ?? [] };
    }
    case "admin.upsertCoupon": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const row = { ...payload.coupon, code: (payload.coupon.code || "").toUpperCase() };
      const { error } = await admin.from("coupons").upsert(row);
      return error ? { ok: false, message: error.message } : { ok: true };
    }
    case "admin.deleteCoupon": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { error } = await admin.from("coupons").delete().eq("id", payload.id);
      return error ? { ok: false, message: error.message } : { ok: true };
    }

    // ============ COLLECTIONS ============
    case "admin.listCollections": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { data: cols, error } = await admin.from("collections").select("*").order("order", { ascending: true });
      if (error) return { ok: false, message: error.message };
      const { data: cps } = await admin.from("collection_products").select("collection_id, product_id, position");
      return { ok: true, collections: cols ?? [], products: cps ?? [] };
    }
    case "admin.upsertCollection": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { data: up, error } = await admin.from("collections").upsert(payload.collection).select("id").single();
      if (error || !up) return { ok: false, message: error?.message ?? "Falha ao salvar" };
      const id = (up as any).id;
      await admin.from("collection_products").delete().eq("collection_id", id);
      if (payload.productIds?.length) {
        const rows = payload.productIds.map((pid: string, i: number) => ({ collection_id: id, product_id: pid, position: i }));
        const { error: e2 } = await admin.from("collection_products").insert(rows);
        if (e2) return { ok: false, message: e2.message };
      }
      return { ok: true, id };
    }
    case "admin.deleteCollection": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { error } = await admin.from("collections").delete().eq("id", payload.id);
      return error ? { ok: false, message: error.message } : { ok: true };
    }

    // ============ ANALYTICS ============
    case "public.logEvent": {
      const d = payload;
      if (!d?.leadId || !d?.sessionId || !d?.event) return { ok: false };
      await admin.from("analytics_events").insert({
        lead_id: String(d.leadId).slice(0, 80),
        session_id: String(d.sessionId).slice(0, 80),
        event: String(d.event).slice(0, 80),
        page_url: d.pageUrl?.slice(0, 500) ?? null,
        page_path: d.pagePath?.slice(0, 300) ?? null,
        page_title: d.pageTitle?.slice(0, 300) ?? null,
        referrer: d.referrer?.slice(0, 500) ?? null,
        device: d.device ?? null,
        language: d.language?.slice(0, 20) ?? null,
        user_agent: d.userAgent?.slice(0, 500) ?? null,
        utm_source: d.utmSource?.slice(0, 120) ?? null,
        utm_medium: d.utmMedium?.slice(0, 120) ?? null,
        utm_campaign: d.utmCampaign?.slice(0, 120) ?? null,
        product_id: d.productId?.slice(0, 120) ?? null,
        product_name: d.productName?.slice(0, 300) ?? null,
        category: d.category?.slice(0, 120) ?? null,
        price: typeof d.price === "number" ? d.price : null,
        affiliate_url: d.affiliateUrl?.slice(0, 800) ?? null,
        placement: d.placement?.slice(0, 120) ?? null,
        params: d.params ?? {},
      });
      return { ok: true };
    }
    case "admin.listLeads": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const days = Math.min(Math.max(payload.days ?? 30, 1), 180);
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const { data: rows, error } = await admin.from("analytics_events").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(5000);
      if (error) return { ok: false, message: error.message };
      const events = rows ?? [];
      const byLead = new Map<string, any[]>();
      for (const ev of events) { const arr = byLead.get(ev.lead_id) ?? []; arr.push(ev); byLead.set(ev.lead_id, arr); }
      const leads: any[] = [];
      for (const [leadId, list] of byLead.entries()) {
        list.sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));
        const sessions = new Set(list.map((e: any) => e.session_id));
        const last = list[list.length - 1], first = list[0];
        leads.push({
          leadId, firstSeen: first.created_at, lastSeen: last.created_at,
          eventCount: list.length, sessions: sessions.size,
          device: last.device ?? first.device,
          utmSource: last.utm_source ?? first.utm_source,
          utmMedium: last.utm_medium ?? first.utm_medium,
          utmCampaign: last.utm_campaign ?? first.utm_campaign,
          affiliateClicks: list.filter((e: any) => e.event === "affiliate_click").length,
          pageViews: list.filter((e: any) => e.event === "page_view").length,
          lastPage: last.page_path ?? last.page_url, lastEvent: last.event,
        });
      }
      leads.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
      const totals = {
        leads: leads.length, events: events.length,
        pageViews: events.filter((e: any) => e.event === "page_view").length,
        affiliateClicks: events.filter((e: any) => e.event === "affiliate_click").length,
        sessions: new Set(events.map((e: any) => e.session_id)).size,
      };
      return { ok: true, leads, totals };
    }
    case "admin.listLeadEvents": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      const { data, error } = await admin.from("analytics_events").select("*").eq("lead_id", payload.leadId).order("created_at", { ascending: false }).limit(2000);
      return error ? { ok: false, message: error.message } : { ok: true, events: data ?? [] };
    }
    case "admin.resetAnalytics": {
      const auth = await requireAuth(payload); if (!auth.ok) return auth;
      if (payload.confirm !== "ZERAR") return { ok: false, message: "Confirmação inválida" };
      const { error, count } = await admin.from("analytics_events").delete({ count: "exact" }).gt("id", 0);
      return error ? { ok: false, message: error.message } : { ok: true, deleted: count ?? 0 };
    }

    // ============ CHECKOUT ============
    case "public.getOrderStatus": {
      const ref = String(payload?.externalRef || "").slice(0, 120);
      if (!ref) return { ok: false, message: "Referência inválida" };
      const { data: row, error } = await admin.from("orders")
        .select("status, paid_at, amount_cents, order_items(product_name)")
        .eq("external_ref", ref).maybeSingle();
      if (error || !row) return { ok: false, message: "Pedido não encontrado" };
      const items = (row as any).order_items ?? [];
      return { ok: true, status: (row as any).status, paidAt: (row as any).paid_at, amountCents: (row as any).amount_cents, productName: items[0]?.product_name ?? "" };
    }
    case "public.validateCoupon": {
      const code = String(payload?.code || "").trim().toUpperCase();
      const subtotalCents = Math.max(0, Math.floor(payload?.subtotalCents || 0));
      const shippingCents = Math.max(0, Math.floor(payload?.shippingCents || 0));
      if (!code) return { ok: false, message: "Informe um cupom" };
      const { data: row, error } = await admin.from("coupons")
        .select("code, discount_type, discount_value, min_order, active, expires_at, max_uses, used_count")
        .eq("code", code).maybeSingle();
      if (error || !row) return { ok: false, message: "Cupom inválido" };
      const r: any = row;
      if (!r.active) return { ok: false, message: "Cupom desativado" };
      if (r.expires_at && new Date(r.expires_at) < new Date()) return { ok: false, message: "Cupom expirado" };
      if (r.max_uses && r.used_count >= r.max_uses) return { ok: false, message: "Cupom esgotado" };
      const minOrderCents = Math.round(Number(r.min_order) * 100);
      if (subtotalCents < minOrderCents) return { ok: false, message: `Pedido mínimo de R$ ${(minOrderCents / 100).toFixed(2)}` };
      const type = (r.discount_type || "percent") as "percent" | "fixed" | "shipping";
      let discountCents = 0;
      if (type === "percent") discountCents = Math.round(subtotalCents * (Number(r.discount_value) / 100));
      else if (type === "fixed") discountCents = Math.round(Number(r.discount_value) * 100);
      else if (type === "shipping") discountCents = shippingCents;
      discountCents = Math.min(discountCents, subtotalCents + shippingCents);
      return { ok: true, code: r.code, discountType: type, discountValue: Number(r.discount_value), discountCents,
        message: type === "shipping" ? "Frete grátis aplicado" : `Desconto de R$ ${(discountCents / 100).toFixed(2)} aplicado` };
    }
    case "public.createPixOrder": return await createPixOrder(payload, false);
    case "public.createCartPixOrder": return await createPixOrder(payload, true);
  }
  return { ok: false, message: `Ação desconhecida: ${action}` };
}

async function createPixOrder(data: any, cart: boolean): Promise<any> {
  const apiKey = await getGatewayApiKey();
  if (!apiKey) return { ok: false, message: "Gateway não configurado" };
  const name = (data.customer?.name || "").trim();
  const email = (data.customer?.email || "").trim().toLowerCase();
  const cpf = digits(data.customer?.cpf || "");
  const phone = digits(data.customer?.phone || "");
  const amount = Math.max(1, Math.floor(data.amountCents || 0));
  if (name.length < 3) return { ok: false, message: "Nome inválido" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "E-mail inválido" };
  if (cpf.length !== 11) return { ok: false, message: "CPF inválido" };
  if (phone.length < 10 || phone.length > 13) return { ok: false, message: "Telefone inválido" };

  const externalRef = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const orderInsert: any = {
    external_ref: externalRef, status: "PENDING", amount_cents: amount,
    customer_name: name, customer_email: email, customer_cpf: cpf, customer_phone: phone,
  };
  if (cart) {
    orderInsert.subtotal_cents = Math.max(0, Math.floor(data.subtotalCents || 0));
    orderInsert.shipping_cents = Math.max(0, Math.floor(data.shippingCents || 0));
    orderInsert.discount_cents = Math.max(0, Math.floor(data.discountCents || 0));
    orderInsert.coupon_code = data.couponCode || null;
    orderInsert.shipping_method = data.shippingMethod || null;
    orderInsert.payment_method = "PIX";
    orderInsert.user_id = data.userId || null;
    orderInsert.shipping_address = data.address ?? null;
  }
  const { data: orderRow, error: insErr } = await admin.from("orders").insert(orderInsert).select("id").single();
  if (insErr || !orderRow) return { ok: false, message: "Falha ao registrar pedido" };

  if (cart && Array.isArray(data.items)) {
    await admin.from("order_items").insert(data.items.map((it: any) => ({
      order_id: (orderRow as any).id,
      product_id: it.productId,
      product_name: (it.productName || "").slice(0, 300),
      product_image: it.productImage || null,
      quantity: Math.max(1, Math.floor(it.quantity || 1)),
      unit_price_cents: Math.max(0, Math.floor(it.unitPriceCents || 0)),
      variant: it.variant || null,
    })));
  } else {
    await admin.from("order_items").insert({
      order_id: (orderRow as any).id,
      product_id: data.productId,
      product_name: (data.productName || "").slice(0, 300),
      quantity: 1,
      unit_price_cents: amount,
    });
  }

  const notificationUrl = `${SUPABASE_URL}/functions/v1/streetpays-webhook`;
  const items = cart ? data.items.map((it: any) => ({
    quantity: it.quantity, name: (it.productName || "").slice(0, 140), price: it.unitPriceCents, type: "PHYSICAL",
  })) : [{ quantity: 1, name: (data.productName || "").slice(0, 140), price: amount, type: "PHYSICAL" }];
  const addr = data.address ?? {};
  const description = cart ? `Pedido ${(data.items?.[0]?.productName || "compra")}`.slice(0, 140) : `Pedido ${data.productName}`.slice(0, 140);

  let gatewayJson: any = null;
  try {
    const resp = await fetch("https://api.streetpays.com.br/v1/payment", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        amount, currency: "BRL", method: "PIX", description, externalRef, notificationUrl,
        payer: { name, taxId: cpf, email, phone },
        delivery: {
          fee: 0,
          address: {
            street: (addr.street || "Rua não informada").slice(0, 200),
            number: (addr.number || "S/N").slice(0, 20),
            complement: (addr.complement || "").slice(0, 100),
            district: (addr.neighborhood || "Centro").slice(0, 100),
            city: (addr.city || "São Paulo").slice(0, 100),
            state: (addr.uf || "SP").toUpperCase().slice(0, 2),
            zipCode: digits(addr.cep || "") || "01001000",
            country: "BR",
          },
        },
        items,
      }),
    });
    const txt = await resp.text();
    try { gatewayJson = JSON.parse(txt); } catch { gatewayJson = { raw: txt }; }
    if (!resp.ok) {
      await admin.from("orders").update({ status: "FAILED", raw_response: gatewayJson }).eq("external_ref", externalRef);
      return { ok: false, message: pickString(gatewayJson, ["message", "error", "error.message", "errors.0.message"]) || `Gateway respondeu ${resp.status}` };
    }
  } catch (e) {
    await admin.from("orders").update({ status: "FAILED", raw_response: { error: String(e) } }).eq("external_ref", externalRef);
    return { ok: false, message: "Não foi possível gerar o PIX no momento" };
  }

  const copyPaste = pickString(gatewayJson, [
    "data.copypaste","copypaste","pix.emv","pix.copyPaste","pix.qrCode","pix.qr_code","pix.payload",
    "pixCopyPaste","emv","qrCode","qr_code","qrcode","payload",
    "data.pix.emv","data.pix.qrCode","data.pix.copyPaste","data.qrCode","data.copyPaste",
    "payment.pix.emv","payment.qrCode","brCode",
  ]) || "";
  let qrImage = pickString(gatewayJson, [
    "pix.qrCodeImage","pix.qrCodeBase64","pix.image","pix.imageBase64",
    "qrCodeImage","qrCodeBase64","qr_code_base64","image",
    "data.pix.qrCodeImage","data.qrCodeImage",
  ]) || "";
  if (qrImage && !qrImage.startsWith("data:")) qrImage = `data:image/png;base64,${qrImage.replace(/^data:.*base64,/, "")}`;
  if (!copyPaste && !qrImage) {
    await admin.from("orders").update({ status: "FAILED", raw_response: gatewayJson }).eq("external_ref", externalRef);
    return { ok: false, message: "Gateway não retornou o PIX. Tente novamente." };
  }
  if (!qrImage && copyPaste) {
    try { qrImage = await QRCode.toDataURL(copyPaste, { margin: 1, width: 320 }); } catch { /* ignore */ }
  }
  const gatewayId = pickString(gatewayJson, ["id","transactionId","paymentId","data.id","payment.id"]);
  await admin.from("orders").update({
    gateway_id: gatewayId ?? null,
    qr_code: qrImage || null,
    copy_paste: copyPaste || null,
    raw_response: gatewayJson,
  }).eq("external_ref", externalRef);

  return { ok: true, externalRef, qrCodeImage: qrImage, copyPaste, amountCents: amount };
}

// ---------- HTTP ----------
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, { status: 405 }, origin);
  let body: any;
  try { body = await req.json(); } catch { return json({ ok: false, message: "JSON inválido" }, { status: 400 }, origin); }
  const action = String(body?.action || "");
  const payload = body?.payload ?? {};
  try {
    const result = await dispatch(action, payload, { origin });
    return json(result, {}, origin);
  } catch (e) {
    console.error("api dispatch error", action, e);
    return json({ ok: false, message: (e as Error).message ?? "Erro interno" }, { status: 500 }, origin);
  }
});
