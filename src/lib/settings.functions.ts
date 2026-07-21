import { createServerFn } from "@tanstack/react-start";
import { callEdgeApi } from "./edge-api.server";

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

export const getSettingsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    try {
      const s = await callEdgeApi<SiteSettings>("public.getSettings", {});
      return { ...EMPTY, ...(s ?? {}) };
    } catch {
      return EMPTY;
    }
  },
);

export const upsertSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; settings: SiteSettings }) => data)
  .handler(async ({ data }) => {
    return await callEdgeApi<{ ok: true } | { ok: false; message: string }>(
      "admin.upsertSettings",
      data,
    );
  });

export const getAdminGatewayFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(
    async ({ data }): Promise<
      | { ok: true; streetpaysApiKey: string; hasEnvFallback: boolean }
      | { ok: false; message: string }
    > => {
      return await callEdgeApi("admin.getGateway", data);
    },
  );

export const upsertAdminGatewayFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; streetpaysApiKey: string }) => data)
  .handler(async ({ data }) => {
    return await callEdgeApi<{ ok: true } | { ok: false; message: string }>(
      "admin.upsertGateway",
      data,
    );
  });
