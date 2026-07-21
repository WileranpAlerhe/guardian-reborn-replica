import { createServerFn } from "@tanstack/react-start";

export type CreatePixInput = {
  productId: string;
  productSlug?: string;
  productName: string;
  amountCents: number;
  customer: {
    name: string;
    email: string;
    cpf: string; // digits only
    phone: string; // digits only
  };
  address?: {
    cep: string; // digits only
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    uf: string;
  };
};

export type CreatePixResult =
  | { ok: true; externalRef: string; qrCodeImage: string; copyPaste: string; amountCents: number }
  | { ok: false; message: string };

function digits(s: string) {
  return (s || "").replace(/\D/g, "");
}

async function getGatewayApiKey(): Promise<string> {
  const envKey = process.env.STREETPAYS_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("streetpays_api_key")
      .eq("id", "default")
      .maybeSingle();
    const k = ((data as Record<string, unknown> | null)?.streetpays_api_key as string) ?? "";
    return k.trim();
  } catch {
    return "";
  }
}

function pickString(obj: unknown, paths: string[]): string | null {
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
  }
  return null;
}

export const createPixOrderFn = createServerFn({ method: "POST" })
  .inputValidator((data: CreatePixInput) => data)
  .handler(async ({ data }): Promise<CreatePixResult> => {
    const apiKey = await getGatewayApiKey();
    if (!apiKey) return { ok: false, message: "Gateway não configurado" };

    // Validation
    const name = (data.customer?.name || "").trim();
    const email = (data.customer?.email || "").trim().toLowerCase();
    const cpf = digits(data.customer?.cpf || "");
    const phone = digits(data.customer?.phone || "");
    const amount = Math.max(1, Math.floor(data.amountCents || 0));

    if (name.length < 3 || name.length > 120) return { ok: false, message: "Nome inválido" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "E-mail inválido" };
    if (cpf.length !== 11) return { ok: false, message: "CPF inválido" };
    if (phone.length < 10 || phone.length > 13) return { ok: false, message: "Telefone inválido" };
    if (!data.productId || !data.productName) return { ok: false, message: "Produto inválido" };

    const externalRef = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Persist pending order
    const { data: orderRow, error: insErr } = await supabaseAdmin
      .from("orders")
      .insert({
        external_ref: externalRef,
        status: "PENDING",
        amount_cents: amount,
        customer_name: name,
        customer_email: email,
        customer_cpf: cpf,
        customer_phone: phone,
      })
      .select("id")
      .single();
    if (insErr || !orderRow) return { ok: false, message: "Falha ao registrar pedido" };
    await supabaseAdmin.from("order_items").insert({
      order_id: orderRow.id,
      product_id: data.productId,
      product_name: data.productName.slice(0, 300),
      quantity: 1,
      unit_price_cents: amount,
    });

    // Build webhook URL (same origin)
    const req = (globalThis as unknown as { Request?: unknown }).Request;
    void req;
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const origin = new URL(request.url).origin;
    const notificationUrl = `${origin}/api/public/webhooks/streetpays`;

    // Call StreetPays
    let gatewayJson: unknown = null;
    try {
      const resp = await fetch("https://api.streetpays.com.br/v1/payment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "BRL",
          method: "PIX",
          description: `Pedido ${data.productName}`.slice(0, 140),
          externalRef,
          notificationUrl,
          payer: {
            name,
            taxId: cpf,
            email,
            phone,
          },
          delivery: {
            fee: 0,
            address: {
              street: (data.address?.street || "Rua não informada").slice(0, 200),
              number: (data.address?.number || "S/N").slice(0, 20),
              complement: (data.address?.complement || "").slice(0, 100),
              district: (data.address?.neighborhood || "Centro").slice(0, 100),
              city: (data.address?.city || "São Paulo").slice(0, 100),
              state: (data.address?.uf || "SP").toUpperCase().slice(0, 2),
              zipCode: digits(data.address?.cep || "") || "01001000",
              country: "BR",
            },
          },
          items: [
            {
              quantity: 1,
              name: data.productName.slice(0, 140),
              price: amount,
              type: "PHYSICAL",
            },
          ],
        }),
      });
      const txt = await resp.text();
      try {
        gatewayJson = JSON.parse(txt);
      } catch {
        gatewayJson = { raw: txt };
      }
      if (!resp.ok) {
        await supabaseAdmin
          .from("orders")
          .update({ status: "FAILED", raw_response: gatewayJson as never })
          .eq("external_ref", externalRef);
        const msg =
          pickString(gatewayJson, ["message", "error", "error.message", "errors.0.message"]) ||
          `Gateway respondeu ${resp.status}`;
        return { ok: false, message: msg };
      }
    } catch (e) {
      await supabaseAdmin
        .from("orders")
        .update({ status: "FAILED", raw_response: { error: String(e) } as never })
        .eq("external_ref", externalRef);
      return { ok: false, message: "Não foi possível gerar o PIX no momento" };
    }

    // Extract copy-paste and (optional) base64 QR image from many possible shapes
    const copyPaste =
      pickString(gatewayJson, [
        "data.copypaste",
        "copypaste",
        "pix.emv",
        "pix.copyPaste",
        "pix.qrCode",
        "pix.qr_code",
        "pix.payload",
        "pixCopyPaste",
        "emv",
        "qrCode",
        "qr_code",
        "qrcode",
        "payload",
        "data.pix.emv",
        "data.pix.qrCode",
        "data.pix.copyPaste",
        "data.qrCode",
        "data.copyPaste",
        "payment.pix.emv",
        "payment.qrCode",
        "brCode",
      ]) || "";

    let qrImage =
      pickString(gatewayJson, [
        "pix.qrCodeImage",
        "pix.qrCodeBase64",
        "pix.image",
        "pix.imageBase64",
        "qrCodeImage",
        "qrCodeBase64",
        "qr_code_base64",
        "image",
        "data.pix.qrCodeImage",
        "data.qrCodeImage",
      ]) || "";

    if (qrImage && !qrImage.startsWith("data:")) {
      qrImage = `data:image/png;base64,${qrImage.replace(/^data:.*base64,/, "")}`;
    }

    if (!copyPaste && !qrImage) {
      await supabaseAdmin
        .from("orders")
        .update({ status: "FAILED", raw_response: gatewayJson as never })
        .eq("external_ref", externalRef);
      return { ok: false, message: "Gateway não retornou o PIX. Tente novamente." };
    }

    // Fallback: render QR image from copyPaste if the gateway didn't return one
    if (!qrImage && copyPaste) {
      try {
        const QRCode = (await import("qrcode")).default;
        qrImage = await QRCode.toDataURL(copyPaste, { margin: 1, width: 320 });
      } catch {
        /* ignore */
      }
    }

    const gatewayId = pickString(gatewayJson, [
      "id",
      "transactionId",
      "paymentId",
      "data.id",
      "payment.id",
    ]);

    await supabaseAdmin
      .from("orders")
      .update({
        gateway_id: gatewayId ?? null,
        qr_code: qrImage || null,
        copy_paste: copyPaste || null,
        raw_response: gatewayJson as never,
      })
      .eq("external_ref", externalRef);

    return {
      ok: true,
      externalRef,
      qrCodeImage: qrImage,
      copyPaste,
      amountCents: amount,
    };
  });

export type OrderStatusResult =
  | { ok: true; status: string; paidAt: string | null; amountCents: number; productName: string }
  | { ok: false; message: string };

export const getOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: { externalRef: string }) => data)
  .handler(async ({ data }): Promise<OrderStatusResult> => {
    const ref = String(data?.externalRef || "").slice(0, 120);
    if (!ref) return { ok: false, message: "Referência inválida" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select("status, paid_at, amount_cents, order_items(product_name)")
      .eq("external_ref", ref)
      .maybeSingle();
    if (error || !row) return { ok: false, message: "Pedido não encontrado" };
    const items = (row as { order_items?: { product_name: string }[] }).order_items ?? [];
    return {
      ok: true,
      status: row.status,
      paidAt: row.paid_at,
      amountCents: row.amount_cents,
      productName: items[0]?.product_name ?? "",
    };
  });

// ============================================================
// Coupon validation
// ============================================================
export type CouponResult =
  | { ok: true; code: string; discountType: "percent" | "fixed" | "shipping"; discountValue: number; discountCents: number; message: string }
  | { ok: false; message: string };

export const validateCouponFn = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; subtotalCents: number; shippingCents: number }) => data)
  .handler(async ({ data }): Promise<CouponResult> => {
    const code = String(data?.code || "").trim().toUpperCase();
    const subtotalCents = Math.max(0, Math.floor(data?.subtotalCents || 0));
    const shippingCents = Math.max(0, Math.floor(data?.shippingCents || 0));
    if (!code) return { ok: false, message: "Informe um cupom" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("coupons")
      .select("code, discount_type, discount_value, min_order, active, expires_at, max_uses, used_count")
      .eq("code", code)
      .maybeSingle();
    if (error || !row) return { ok: false, message: "Cupom inválido" };
    if (!row.active) return { ok: false, message: "Cupom desativado" };
    if (row.expires_at && new Date(row.expires_at) < new Date()) return { ok: false, message: "Cupom expirado" };
    if (row.max_uses && row.used_count >= row.max_uses) return { ok: false, message: "Cupom esgotado" };
    const minOrderCents = Math.round(Number(row.min_order) * 100);
    if (subtotalCents < minOrderCents) {
      return { ok: false, message: `Pedido mínimo de R$ ${(minOrderCents / 100).toFixed(2)}` };
    }
    const type = (row.discount_type || "percent") as "percent" | "fixed" | "shipping";
    let discountCents = 0;
    if (type === "percent") discountCents = Math.round(subtotalCents * (Number(row.discount_value) / 100));
    else if (type === "fixed") discountCents = Math.round(Number(row.discount_value) * 100);
    else if (type === "shipping") discountCents = shippingCents;
    discountCents = Math.min(discountCents, subtotalCents + shippingCents);
    return {
      ok: true,
      code: row.code,
      discountType: type,
      discountValue: Number(row.discount_value),
      discountCents,
      message: type === "shipping" ? "Frete grátis aplicado" : `Desconto de R$ ${(discountCents / 100).toFixed(2)} aplicado`,
    };
  });

// ============================================================
// Cart-based order creation (multi-item)
// ============================================================
export type CartItemInput = {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPriceCents: number;
  variant?: string;
};

export type CreateCartPixInput = {
  items: CartItemInput[];
  subtotalCents: number;
  shippingCents: number;
  shippingMethod?: string;
  discountCents: number;
  couponCode?: string;
  amountCents: number;
  customer: { name: string; email: string; cpf: string; phone: string };
  address: {
    cep: string; street: string; number: string; complement?: string;
    neighborhood: string; city: string; uf: string;
  };
  userId?: string;
};

export const createCartPixOrderFn = createServerFn({ method: "POST" })
  .inputValidator((data: CreateCartPixInput) => data)
  .handler(async ({ data }): Promise<CreatePixResult> => {
    const apiKey = await getGatewayApiKey();
    if (!apiKey) return { ok: false, message: "Gateway não configurado" };

    const name = (data.customer?.name || "").trim();
    const email = (data.customer?.email || "").trim().toLowerCase();
    const cpf = digits(data.customer?.cpf || "");
    const phone = digits(data.customer?.phone || "");
    const amount = Math.max(1, Math.floor(data.amountCents || 0));
    if (name.length < 3) return { ok: false, message: "Nome inválido" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "E-mail inválido" };
    if (cpf.length !== 11) return { ok: false, message: "CPF inválido" };
    if (phone.length < 10) return { ok: false, message: "Telefone inválido" };
    if (!Array.isArray(data.items) || data.items.length === 0) return { ok: false, message: "Carrinho vazio" };

    const externalRef = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: orderRow, error: insErr } = await supabaseAdmin
      .from("orders")
      .insert({
        external_ref: externalRef,
        status: "PENDING",
        amount_cents: amount,
        subtotal_cents: Math.max(0, Math.floor(data.subtotalCents || 0)),
        shipping_cents: Math.max(0, Math.floor(data.shippingCents || 0)),
        discount_cents: Math.max(0, Math.floor(data.discountCents || 0)),
        coupon_code: data.couponCode || null,
        shipping_method: data.shippingMethod || null,
        payment_method: "PIX",
        customer_name: name,
        customer_email: email,
        customer_cpf: cpf,
        customer_phone: phone,
        user_id: data.userId || null,
        shipping_address: data.address as never,
      })
      .select("id")
      .single();
    if (insErr || !orderRow) return { ok: false, message: "Falha ao registrar pedido" };

    await supabaseAdmin.from("order_items").insert(
      data.items.map((it) => ({
        order_id: orderRow.id,
        product_id: it.productId,
        product_name: it.productName.slice(0, 300),
        product_image: it.productImage || null,
        quantity: Math.max(1, Math.floor(it.quantity || 1)),
        unit_price_cents: Math.max(0, Math.floor(it.unitPriceCents || 0)),
        variant: it.variant || null,
      })),
    );

    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const origin = new URL(request.url).origin;
    const notificationUrl = `${origin}/api/public/webhooks/streetpays`;

    let gatewayJson: unknown = null;
    try {
      const firstName = data.items[0]?.productName || "Pedido";
      const resp = await fetch("https://api.streetpays.com.br/v1/payment", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          amount,
          currency: "BRL",
          method: "PIX",
          description: `Pedido ${firstName}`.slice(0, 140),
          externalRef,
          notificationUrl,
          payer: { name, taxId: cpf, email, phone },
          delivery: {
            fee: 0,
            address: {
              street: data.address.street.slice(0, 200),
              number: (data.address.number || "S/N").slice(0, 20),
              complement: (data.address.complement || "").slice(0, 100),
              district: (data.address.neighborhood || "Centro").slice(0, 100),
              city: (data.address.city || "").slice(0, 100),
              state: (data.address.uf || "SP").toUpperCase().slice(0, 2),
              zipCode: digits(data.address.cep) || "01001000",
              country: "BR",
            },
          },
          items: data.items.map((it) => ({
            quantity: it.quantity,
            name: it.productName.slice(0, 140),
            price: it.unitPriceCents,
            type: "PHYSICAL",
          })),
        }),
      });
      const txt = await resp.text();
      try { gatewayJson = JSON.parse(txt); } catch { gatewayJson = { raw: txt }; }
      if (!resp.ok) {
        await supabaseAdmin.from("orders").update({ status: "FAILED", raw_response: gatewayJson as never }).eq("external_ref", externalRef);
        return { ok: false, message: pickString(gatewayJson, ["message", "error", "error.message"]) || `Gateway respondeu ${resp.status}` };
      }
    } catch (e) {
      await supabaseAdmin.from("orders").update({ status: "FAILED", raw_response: { error: String(e) } as never }).eq("external_ref", externalRef);
      return { ok: false, message: "Não foi possível gerar o PIX no momento" };
    }

    const copyPaste = pickString(gatewayJson, [
      "data.copypaste", "copypaste", "pix.emv", "pix.copyPaste", "pix.qrCode", "pix.qr_code", "pix.payload",
      "pixCopyPaste", "emv", "qrCode", "qr_code", "qrcode", "payload",
      "data.pix.emv", "data.pix.qrCode", "data.pix.copyPaste", "data.qrCode", "data.copyPaste",
      "payment.pix.emv", "payment.qrCode", "brCode",
    ]) || "";
    let qrImage = pickString(gatewayJson, [
      "pix.qrCodeImage", "pix.qrCodeBase64", "pix.image", "pix.imageBase64",
      "qrCodeImage", "qrCodeBase64", "qr_code_base64", "image",
      "data.pix.qrCodeImage", "data.qrCodeImage",
    ]) || "";
    if (qrImage && !qrImage.startsWith("data:")) qrImage = `data:image/png;base64,${qrImage.replace(/^data:.*base64,/, "")}`;
    if (!copyPaste && !qrImage) {
      await supabaseAdmin.from("orders").update({ status: "FAILED", raw_response: gatewayJson as never }).eq("external_ref", externalRef);
      return { ok: false, message: "Gateway não retornou o PIX. Tente novamente." };
    }
    if (!qrImage && copyPaste) {
      try {
        const QRCode = (await import("qrcode")).default;
        qrImage = await QRCode.toDataURL(copyPaste, { margin: 1, width: 320 });
      } catch { /* ignore */ }
    }
    const gatewayId = pickString(gatewayJson, ["id", "transactionId", "paymentId", "data.id", "payment.id"]);
    await supabaseAdmin.from("orders").update({
      gateway_id: gatewayId ?? null,
      qr_code: qrImage || null,
      copy_paste: copyPaste || null,
      raw_response: gatewayJson as never,
    }).eq("external_ref", externalRef);

    return { ok: true, externalRef, qrCodeImage: qrImage, copyPaste, amountCents: amount };
  });
