import { createServerFn } from "@tanstack/react-start";
import { callEdgeApi } from "./edge-api.server";

type Result<T = { ok: true }> = T | { ok: false; message: string };
type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Row = { [k: string]: Json };

// ============ ORDERS ============
export const listOrdersFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    return await callEdgeApi<
      { ok: true; orders: Row[] } | { ok: false; message: string }
    >("admin.listOrders", data);
  });

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string; status: string }) => data)
  .handler(async ({ data }): Promise<Result> => {
    return await callEdgeApi<Result>("admin.updateOrderStatus", data);
  });

// ============ COUPONS ============
type CouponInput = {
  id?: string;
  code: string;
  description?: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  max_uses?: number | null;
  active: boolean;
  expires_at?: string | null;
};

export const listCouponsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    return await callEdgeApi<
      { ok: true; coupons: Row[] } | { ok: false; message: string }
    >("admin.listCoupons", data);
  });

export const upsertCouponFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; coupon: CouponInput }) => data)
  .handler(async ({ data }): Promise<Result> => {
    return await callEdgeApi<Result>("admin.upsertCoupon", data);
  });

export const deleteCouponFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) => data)
  .handler(async ({ data }): Promise<Result> => {
    return await callEdgeApi<Result>("admin.deleteCoupon", data);
  });

// ============ COLLECTIONS ============
type CollectionInput = {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  banner_url?: string | null;
  active: boolean;
  order: number;
};

export const listCollectionsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    return await callEdgeApi<
      | { ok: true; collections: Row[]; products: Row[] }
      | { ok: false; message: string }
    >("admin.listCollections", data);
  });

export const upsertCollectionFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { password: string; collection: CollectionInput; productIds: string[] }) => data,
  )
  .handler(async ({ data }): Promise<Result<{ ok: true; id: string }>> => {
    return await callEdgeApi<Result<{ ok: true; id: string }>>(
      "admin.upsertCollection",
      data,
    );
  });

export const deleteCollectionFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) => data)
  .handler(async ({ data }): Promise<Result> => {
    return await callEdgeApi<Result>("admin.deleteCollection", data);
  });
