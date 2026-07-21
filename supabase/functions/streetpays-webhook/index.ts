// Webhook StreetPays — recebe callbacks públicas do gateway.
// URL: https://<PROJECT>.supabase.co/functions/v1/streetpays-webhook
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const WEBHOOK_TOKEN = Deno.env.get("STREETPAYS_WEBHOOK_TOKEN") ?? ""; // opcional

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, x-signature, x-webhook-token",
};

function pick(obj: unknown, paths: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const path of paths) {
    const parts = path.split("."); let cur: any = obj;
    for (const p of parts) { if (cur && typeof cur === "object" && p in cur) cur = cur[p]; else { cur = undefined; break; } }
    if (typeof cur === "string" && cur.length > 0) return cur;
    if (typeof cur === "number") return String(cur);
  }
  return null;
}
function normalize(raw: string | null) {
  const s = (raw || "").toUpperCase();
  if (["PAID","APPROVED","COMPLETED","SUCCESS","SUCCEEDED","CONFIRMED","SETTLED"].includes(s)) return "PAID";
  if (["CANCELED","CANCELLED","FAILED","DECLINED","REFUSED","EXPIRED","REJECTED"].includes(s)) return "FAILED";
  if (["REFUNDED","CHARGEBACK"].includes(s)) return "REFUNDED";
  return "PENDING";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method === "GET") {
    return new Response(JSON.stringify({ ok: true, hint: "StreetPays webhook endpoint" }), {
      status: 200, headers: { "Content-Type": "application/json", ...cors },
    });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  // Token opcional na query (?token=...) ou header x-webhook-token
  if (WEBHOOK_TOKEN) {
    const url = new URL(req.url);
    const t = url.searchParams.get("token") || req.headers.get("x-webhook-token") || "";
    if (t !== WEBHOOK_TOKEN) {
      return new Response(JSON.stringify({ ok: false, reason: "unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...cors },
      });
    }
  }

  const text = await req.text();
  let payload: any = null;
  try { payload = JSON.parse(text); } catch { payload = { raw: text }; }

  const externalRef = pick(payload, [
    "externalRef","external_ref","reference","data.externalRef","data.external_ref",
    "payment.externalRef","payment.external_ref",
  ]) || "";
  const status = normalize(pick(payload, ["status","event","data.status","payment.status","type"]));

  if (!externalRef) {
    return new Response(JSON.stringify({ ok: false, reason: "missing externalRef" }), {
      status: 200, headers: { "Content-Type": "application/json", ...cors },
    });
  }

  try {
    // Idempotência: só sobrescreve status pra estados finais e evita reprocessar pagamentos já pagos
    const { data: existing } = await admin.from("orders").select("status, paid_at").eq("external_ref", externalRef).maybeSingle();
    const cur = (existing as any)?.status ?? null;
    const update: any = { raw_webhook: payload };
    if (status !== "PENDING") {
      if (cur === "PAID" && status !== "REFUNDED") {
        // já pago; nada muda
      } else {
        update.status = status;
        if (status === "PAID" && !(existing as any)?.paid_at) update.paid_at = new Date().toISOString();
      }
    }
    await admin.from("orders").update(update).eq("external_ref", externalRef);
  } catch (e) {
    console.error("webhook error", e);
    // Nunca 500 pra webhook — evita reenvio em loop
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { "Content-Type": "application/json", ...cors },
  });
});
