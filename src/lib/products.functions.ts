import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";
import type { Product, ProductBadge } from "@/data/seed";

type Result<T = { ok: true }> = T | { ok: false; message: string };

function verify(password: string): { ok: true } | { ok: false; message: string } {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return { ok: false, message: "SITE_PASSWORD nao configurado no servidor" };
  const a = createHash("sha256").update(password ?? "", "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, message: "Senha do admin incorreta. Faca login novamente." };
  }
  return { ok: true };
}

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

function toRow(p: ProductInput) {
  return {
    id: p.id,
    slug: p.slug ?? null,
    name: p.name,
    description: p.description ?? null,
    image: p.image ?? "",
    category: p.category,
    old_price: p.oldPrice,
    price: p.price,
    sold: p.sold,
    rating: p.rating,
    affiliate_url: p.affiliateUrl,
    badges: p.badges,
    coupon_text: p.couponText ?? null,
    active: p.active,
    order: p.order,
  };
}

export const upsertProductFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; product: ProductInput }) => data)
  .handler(async ({ data }): Promise<Result> => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("products").upsert(toRow(data.product));
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, message: (e as Error).message ?? "Falha ao salvar" };
    }
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; id: string }) => data)
  .handler(async ({ data }): Promise<Result> => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, message: (e as Error).message ?? "Falha ao excluir" };
    }
  });

export const reorderProductsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; ids: string[] }) => data)
  .handler(async ({ data }): Promise<Result> => {
    const auth = verify(data.password);
    if (!auth.ok) return auth;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      for (let i = 0; i < data.ids.length; i++) {
        const { error } = await supabaseAdmin
          .from("products")
          .update({ order: i })
          .eq("id", data.ids[i]);
        if (error) return { ok: false, message: error.message };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, message: (e as Error).message ?? "Falha ao reordenar" };
    }
  });

export const verifyPasswordFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const auth = verify(data.password);
    return { ok: auth.ok };
  });
