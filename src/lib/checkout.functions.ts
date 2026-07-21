import { createServerFn } from "@tanstack/react-start";
import { callEdgeApi } from "./edge-api.server";

export type CreatePixInput = {
  productId: string;
  productSlug?: string;
  productName: string;
  amountCents: number;
  customer: { name: string; email: string; cpf: string; phone: string };
  address?: {
    cep: string; street: string; number: string; complement?: string;
    neighborhood: string; city: string; uf: string;
  };
};

export type CreatePixResult =
  | { ok: true; externalRef: string; qrCodeImage: string; copyPaste: string; amountCents: number }
  | { ok: false; message: string };

export const createPixOrderFn = createServerFn({ method: "POST" })
  .inputValidator((data: CreatePixInput) => data)
  .handler(async ({ data }): Promise<CreatePixResult> => {
    return await callEdgeApi<CreatePixResult>("public.createPixOrder", data);
  });

export type OrderStatusResult =
  | { ok: true; status: string; paidAt: string | null; amountCents: number; productName: string }
  | { ok: false; message: string };

export const getOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: { externalRef: string }) => data)
  .handler(async ({ data }): Promise<OrderStatusResult> => {
    return await callEdgeApi<OrderStatusResult>("public.getOrderStatus", data);
  });

export type CouponResult =
  | {
      ok: true; code: string;
      discountType: "percent" | "fixed" | "shipping";
      discountValue: number; discountCents: number; message: string;
    }
  | { ok: false; message: string };

export const validateCouponFn = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string; subtotalCents: number; shippingCents: number }) => data)
  .handler(async ({ data }): Promise<CouponResult> => {
    return await callEdgeApi<CouponResult>("public.validateCoupon", data);
  });

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
    return await callEdgeApi<CreatePixResult>("public.createCartPixOrder", data);
  });
