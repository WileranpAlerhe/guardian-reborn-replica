import { createFileRoute } from "@tanstack/react-router";

// Compat: a rota antiga do webhook agora redireciona para a Edge Function
// que roda no Lovable Cloud (StreetPays deve usar a URL da Edge Function,
// não este endpoint). Mantido apenas para evitar 404 se algum callback
// antigo ainda apontar pra cá.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Signature, X-Webhook-Token",
};

function edgeUrl() {
  const base =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    "";
  return `${base.replace(/\/+$/, "")}/functions/v1/streetpays-webhook`;
}

export const Route = createFileRoute("/api/public/webhooks/streetpays")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () =>
        new Response(
          JSON.stringify({
            ok: true,
            hint:
              "Este endpoint foi migrado. Configure a StreetPays com a URL da Edge Function em: " +
              edgeUrl(),
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...cors } },
        ),
      POST: async ({ request }) => {
        const target = edgeUrl();
        if (!target || target.startsWith("/functions/")) {
          return new Response(JSON.stringify({ ok: false, reason: "backend não configurado" }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...cors },
          });
        }
        try {
          const body = await request.text();
          const resp = await fetch(target, {
            method: "POST",
            headers: {
              "Content-Type": request.headers.get("content-type") ?? "application/json",
              "x-webhook-token": request.headers.get("x-webhook-token") ?? "",
            },
            body,
          });
          const txt = await resp.text();
          return new Response(txt || '{"ok":true}', {
            status: resp.status,
            headers: { "Content-Type": "application/json", ...cors },
          });
        } catch {
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...cors },
          });
        }
      },
    },
  },
});
