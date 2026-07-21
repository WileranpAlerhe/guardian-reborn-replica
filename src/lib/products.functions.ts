import { createServerFn } from "@tanstack/react-start";
import type { Product, ProductBadge } from "@/data/seed";
import { callEdgeApi } from "./edge-api.server";

type Result<T = { ok: true }> = T | { ok: false; message: string };

type ProductInput = {
  id: string;
  slug?: string | null;
  name: string;
  description?: string | null;
  image: string;
  category: string;
  oldPrice: number;
  price: number;
  sold: number;
  rating: number;
  affiliateUrl: string;
  badges: ProductBadge[];
  couponText?: string | null;
  active: boolean;
  order: number;
};

export const upsertProductFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; product: ProductInput }) => data)
  .handler(async ({ data }): Promise<Result> => {
    return await callEdgeApi<Result>("admin.upsertProduct", data);
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) => data)
  .handler(async ({ data }): Promise<Result> => {
    return await callEdgeApi<Result>("admin.deleteProduct", data);
  });

export const reorderProductsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; ids: string[] }) => data)
  .handler(async ({ data }): Promise<Result> => {
    return await callEdgeApi<Result>("admin.reorderProducts", data);
  });

export const verifyPasswordFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    return await callEdgeApi<{ ok: boolean }>("admin.verifyPassword", data);
  });

// tipo re-exportado para não quebrar imports existentes
export type { Product };
