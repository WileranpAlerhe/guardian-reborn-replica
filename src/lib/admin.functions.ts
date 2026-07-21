import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";

type Result<T = { ok: true }> = T | { ok: false; message: string };

function verify(password: string): { ok: true } | { ok: false; message: string } {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return { ok: false, message: "SITE_PASSWORD nao configurado no servidor" };
  const a = createHash("sha256").update(password ?? "", "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, message: "Senha do admin incorreta." };
  }
  return { ok: true };
}

// ============ ORDERS ============

export const listOrdersFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const auth = verify(data.password);
    if (!auth.ok) return { ok: false as const, message: auth.message };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, orders: rows ?? [] };
  });

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string; status: string }) => data)
  .handler(async ({ data }): Promise<Result> => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) return { ok: false, message: error.message };
    return { ok: true };
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
    const auth = verify(data.password);
    if (!auth.ok) return { ok: false as const, message: auth.message };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, coupons: rows ?? [] };
  });

export const upsertCouponFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; coupon: CouponInput }) => data)
  .handler(async ({ data }): Promise<Result> => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = { ...data.coupon, code: data.coupon.code.toUpperCase() };
    const { error } = await supabaseAdmin.from("coupons").upsert(row);
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  });

export const deleteCouponFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) => data)
  .handler(async ({ data }): Promise<Result> => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", data.id);
    if (error) return { ok: false, message: error.message };
    return { ok: true };
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
    const auth = verify(data.password);
    if (!auth.ok) return { ok: false as const, message: auth.message };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cols, error } = await supabaseAdmin
      .from("collections")
      .select("*")
      .order("order", { ascending: true });
    if (error) return { ok: false as const, message: error.message };
    const { data: cps } = await supabaseAdmin
      .from("collection_products")
      .select("collection_id, product_id, position");
    return {
      ok: true as const,
      collections: cols ?? [],
      products: cps ?? [],
    };
  });

export const upsertCollectionFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { password: string; collection: CollectionInput; productIds: string[] }) => data,
  )
  .handler(async ({ data }): Promise<Result<{ ok: true; id: string }>> => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: up, error } = await supabaseAdmin
      .from("collections")
      .upsert(data.collection)
      .select("id")
      .single();
    if (error || !up) return { ok: false, message: error?.message ?? "Falha ao salvar" };
    const id = (up as { id: string }).id;
    await supabaseAdmin.from("collection_products").delete().eq("collection_id", id);
    if (data.productIds.length > 0) {
      const rows = data.productIds.map((pid, i) => ({
        collection_id: id,
        product_id: pid,
        position: i,
      }));
      const { error: e2 } = await supabaseAdmin.from("collection_products").insert(rows);
      if (e2) return { ok: false, message: e2.message };
    }
    return { ok: true, id };
  });

export const deleteCollectionFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) => data)
  .handler(async ({ data }): Promise<Result> => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("collections").delete().eq("id", data.id);
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  });