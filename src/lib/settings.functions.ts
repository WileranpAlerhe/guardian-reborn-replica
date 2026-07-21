import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";

export type SiteSettings = {
  gtmId: string;
  ga4Id: string;
  headScript: string;
  bodyStartScript: string;
  bodyEndScript: string;
  pathPrefix: string;
};

export type AdminSettings = SiteSettings & {
  streetpaysApiKey: string;
};

const EMPTY: SiteSettings = {
  gtmId: "",
  ga4Id: "",
  headScript: "",
  bodyStartScript: "",
  bodyEndScript: "",
  pathPrefix: "produto",
};

function sanitizePrefix(v: string): string {
  return (v || "")
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9-_]/g, "");
}

function verify(password: string): { ok: true } | { ok: false; message: string } {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return { ok: false, message: "SITE_PASSWORD nao configurado" };
  const a = createHash("sha256").update(password ?? "", "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, message: "Senha do admin incorreta." };
  }
  return { ok: true };
}

// Public: never returns secrets like streetpays_api_key
export const getSettingsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin
        .from("site_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();
      if (!data) return EMPTY;
      const row = data as Record<string, unknown>;
      return {
        gtmId: (row.gtm_id as string) ?? "",
        ga4Id: (row.ga4_id as string) ?? "",
        headScript: (row.head_script as string) ?? "",
        bodyStartScript: (row.body_start_script as string) ?? "",
        bodyEndScript: (row.body_end_script as string) ?? "",
        pathPrefix: (row.path_prefix as string) ?? "produto",
      };
    } catch {
      return EMPTY;
    }
  },
);

export const upsertSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; settings: SiteSettings }) => data)
  .handler(async ({ data }) => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const prefix = sanitizePrefix(data.settings.pathPrefix || "produto") || "produto";
      const { error } = await supabaseAdmin.from("site_settings").upsert({
        id: "default",
        gtm_id: data.settings.gtmId || null,
        ga4_id: data.settings.ga4Id || null,
        head_script: data.settings.headScript || null,
        body_start_script: data.settings.bodyStartScript || null,
        body_end_script: data.settings.bodyEndScript || null,
        path_prefix: prefix,
        updated_at: new Date().toISOString(),
      });
      if (error) return { ok: false as const, message: error.message };
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, message: (e as Error).message ?? "Falha ao salvar" };
    }
  });

// Admin only: returns the gateway key (masked flag) after password check
export const getAdminGatewayFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; streetpaysApiKey: string; hasEnvFallback: boolean }
      | { ok: false; message: string }
    > => {
      const auth = verify(data.password);
      if (!auth.ok) return auth;
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin
          .from("site_settings")
          .select("streetpays_api_key")
          .eq("id", "default")
          .maybeSingle();
        const key = ((row as Record<string, unknown> | null)?.streetpays_api_key as string) ?? "";
        return {
          ok: true,
          streetpaysApiKey: key,
          hasEnvFallback: !!process.env.STREETPAYS_API_KEY,
        };
      } catch (e) {
        return { ok: false, message: (e as Error).message ?? "Falha ao carregar" };
      }
    },
  );

export const upsertAdminGatewayFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; streetpaysApiKey: string }) => data)
  .handler(async ({ data }) => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const key = (data.streetpaysApiKey || "").trim();
      const { error } = await supabaseAdmin.from("site_settings").upsert({
        id: "default",
        streetpays_api_key: key || null,
        updated_at: new Date().toISOString(),
      });
      if (error) return { ok: false as const, message: error.message };
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, message: (e as Error).message ?? "Falha ao salvar" };
    }
  });
