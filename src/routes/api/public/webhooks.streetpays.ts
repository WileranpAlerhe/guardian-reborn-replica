import { createFileRoute } from "@tanstack/react-router";

// Webhook público chamado pela StreetPays quando o status do pagamento muda.
// Como o gateway não documenta um formato fixo, aceitamos várias variações
// comuns e identificamos o pedido pelo externalRef que enviamos na criação.

function pick(obj: unknown, paths: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const path of paths) {
    const parts = path.split(".");
    let cur: unknown = obj;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === "string" && cur.length > 0) return cur;
    if (typeof cur === "number") return String(cur);
  }
  return null;
}

function normalizeStatus(raw: string | null): string {
  const s = (raw || "").toUpperCase();
  if (["PAID", "APPROVED", "COMPLETED", "SUCCESS", "SUCCEEDED", "CONFIRMED", "SETTLED"].includes(s))
    return "PAID";
  if (["CANCELED", "CANCELLED", "FAILED", "DECLINED", "REFUSED", "EXPIRED", "REJECTED"].includes(s))
    return "FAILED";
  if (["REFUNDED", "CHARGEBACK"].includes(s)) return "REFUNDED";
  return "PENDING";
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Signature",
};

export const Route = createFileRoute("/api/public/webhooks/streetpays")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () =>
        new Response(JSON.stringify({ ok: true, hint: "StreetPays webhook endpoint" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...cors },
        }),
      POST: async ({ request }) => {
        let payload: unknown = null;
        try {
          const text = await request.text();
          try {
            payload = JSON.parse(text);
          } catch {
            payload = { raw: text };
          }
        } catch {
          payload = {};
        }

        const externalRef =
          pick(payload, [
            "externalRef",
            "external_ref",
            "reference",
            "data.externalRef",
            "data.external_ref",
            "payment.externalRef",
            "payment.external_ref",
          ]) || "";

        const statusRaw = pick(payload, [
          "status",
          "event",
          "data.status",
          "payment.status",
          "type",
        ]);
        const status = normalizeStatus(statusRaw);

        if (!externalRef) {
          return new Response(JSON.stringify({ ok: false, reason: "missing externalRef" }), {
            status: 200, // 200 pra evitar reenvio em loop
            headers: { "Content-Type": "application/json", ...cors },
          });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const update: {
            raw_webhook: unknown;
            status?: string;
            paid_at?: string;
          } = { raw_webhook: payload };
          if (status !== "PENDING") update.status = status;
          if (status === "PAID") update.paid_at = new Date().toISOString();
          await supabaseAdmin
            .from("orders")
            .update(update as never)
            .eq("external_ref", externalRef);
        } catch {
          /* swallow – never 500 to a webhook */
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...cors },
        });
      },
    },
  },
});
