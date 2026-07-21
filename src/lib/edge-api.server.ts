// Helper compartilhado: envia { action, payload } para a Edge Function `api`
// no Lovable Cloud. Roda no servidor da Vercel (Node) — usa apenas as
// variáveis públicas SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY (nenhum
// service role sai daqui).
export async function callEdgeApi<T = unknown>(action: string, payload: unknown): Promise<T> {
  const url =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    "";
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    "";
  if (!url || !key) {
    throw new Error(
      "Backend indisponível: defina SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY nas variáveis de ambiente da Vercel.",
    );
  }
  const endpoint = `${url.replace(/\/+$/, "")}/functions/v1/api`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ action, payload }),
  });
  const text = await resp.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = { ok: false, message: `Backend respondeu ${resp.status}: ${text.slice(0, 200)}` };
  }
  if (!resp.ok) {
    const msg =
      (json && typeof json === "object" && "message" in (json as Record<string, unknown>)
        ? String((json as Record<string, unknown>).message)
        : "") || `Backend respondeu ${resp.status}`;
    return { ok: false, message: msg } as unknown as T;
  }
  return json as T;
}
