import { useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  seedProducts,
  seedBanners,
  seedCategories,
  seedConfig,
  type Product,
  type ProductBadge,
  type Banner,
  type Category,
  type SiteConfig,
} from "@/data/seed";
import {
  upsertProductFn,
  deleteProductFn,
  reorderProductsFn,
  verifyPasswordFn,
} from "@/lib/products.functions";

const KEYS = {
  banners: "oe.banners.v1",
  categories: "oe.categories.v1",
  config: "oe.config.v1",
  auth: "oe.auth.v1",
  pw: "oe.pw.v1",
} as const;

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());
function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

// ---- Snapshot cache for non-product config (categories/banners/config) ----
let bannersSnap: Banner[] | null = null;
let categoriesSnap: Category[] | null = null;
let configSnap: SiteConfig | null = null;
subscribe(() => {
  bannersSnap = null;
  categoriesSnap = null;
  configSnap = null;
});

function getBanners(): Banner[] {
  if (!bannersSnap) bannersSnap = read(KEYS.banners, seedBanners);
  return bannersSnap;
}
function getCategories(): Category[] {
  if (!categoriesSnap) categoriesSnap = read(KEYS.categories, seedCategories);
  return categoriesSnap;
}
function getConfig(): SiteConfig {
  if (!configSnap) configSnap = read(KEYS.config, seedConfig);
  return configSnap;
}

export function useBanners(): Banner[] {
  return useSyncExternalStore(subscribe, getBanners, () => seedBanners);
}
export function useCategories(): Category[] {
  return useSyncExternalStore(subscribe, getCategories, () => seedCategories);
}
export function useConfig(): SiteConfig {
  return useSyncExternalStore(subscribe, getConfig, () => seedConfig);
}

// ---- Products: backed by Supabase ----

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image: string;
  category: string;
  old_price: number | string;
  price: number | string;
  sold: number;
  rating: number | string;
  affiliate_url: string;
  badges: string[] | null;
  coupon_text: string | null;
  active: boolean;
  order: number;
  variants?: unknown;
  images?: unknown;
};

function rowToProduct(r: ProductRow & { slug?: string | null }): Product {
  const variants = Array.isArray(r.variants) ? (r.variants as Product["variants"]) : undefined;
  const images = Array.isArray(r.images) ? (r.images as string[]) : undefined;
  return {
    id: r.id,
    slug: r.slug ?? undefined,
    name: r.name,
    description: r.description ?? undefined,
    image: r.image,
    category: r.category,
    oldPrice: Number(r.old_price),
    price: Number(r.price),
    sold: r.sold,
    rating: Number(r.rating),
    affiliateUrl: r.affiliate_url,
    badges: (r.badges ?? []) as ProductBadge[],
    couponText: r.coupon_text ?? undefined,
    active: r.active,
    order: r.order,
    variants: variants && variants.length ? variants : undefined,
    images: images && images.length ? images : undefined,
  };
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("order", { ascending: true });
  if (error) throw error;
  return (data as unknown as ProductRow[]).map(rowToProduct);
}

export const PRODUCTS_QUERY_KEY = ["products"] as const;

const REMOVED_PRODUCT_IDS = new Set<string>([
  "mini-liquidificador",
]);

function mergeProducts(dbList: Product[]): Product[] {
  if (dbList.length === 0) return seedProducts;
  const byId = new Map<string, Product>();
  for (const p of seedProducts) byId.set(p.id, p);
  for (const p of dbList) {
    if (REMOVED_PRODUCT_IDS.has(p.id)) continue;
    const seed = byId.get(p.id);
    // Seed-defined images/main image are authoritative when present — DB rows
    // may hold stale CDN URLs from older asset uploads that now 404. This
    // guarantees hardcoded product photos (e.g. Britânia BAQ2200B) never
    // break, regardless of what's stored in the DB.
    const images = seed?.images && seed.images.length
      ? seed.images
      : (p.images && p.images.length ? p.images : undefined);
    const image = seed?.image ?? p.image;
    byId.set(p.id, { ...p, image, images });
  }
  return Array.from(byId.values()).sort((a, b) => a.order - b.order);
}

export function useProductsQuery() {
  const q = useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: fetchProducts,
    staleTime: 30_000,
  });
  return {
    products: mergeProducts(q.data ?? []),
    isLoading: q.isPending,
    isFetched: q.isFetched,
  };
}

export function useProducts(): Product[] {
  return useProductsQuery().products;
}

// ---- Admin auth (password stored client-side so we can send to server on writes) ----

function getStoredPassword(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS.pw);
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEYS.auth) === "1";
}
export function useAdminLoggedIn(): boolean {
  return useSyncExternalStore(subscribe, isAdminLoggedIn, () => false);
}
export async function loginAdmin(password: string): Promise<boolean> {
  const { ok } = await verifyPasswordFn({ data: { password } });
  if (ok) {
    localStorage.setItem(KEYS.auth, "1");
    localStorage.setItem(KEYS.pw, password);
    emit();
    return true;
  }
  return false;
}
export function logoutAdmin() {
  localStorage.removeItem(KEYS.auth);
  localStorage.removeItem(KEYS.pw);
  emit();
}

// ---- Product mutations (via server functions) ----

function requirePassword(): string {
  const pw = getStoredPassword();
  if (!pw) throw new Error("Sessão do admin expirada. Faça login novamente.");
  return pw;
}

function ensureOk(res: { ok: true } | { ok: false; message: string }) {
  if (!res.ok) throw new Error(res.message);
}

export const store = {
  async upsertProduct(product: Product) {
    const password = requirePassword();
    ensureOk(await upsertProductFn({ data: { password, product } }));
  },
  async deleteProduct(id: string) {
    const password = requirePassword();
    ensureOk(await deleteProductFn({ data: { password, id } }));
  },
  async reorderProducts(ids: string[]) {
    const password = requirePassword();
    ensureOk(await reorderProductsFn({ data: { password, ids } }));
  },
  saveBanners(banners: Banner[]) {
    write(KEYS.banners, banners);
  },
  saveCategories(categories: Category[]) {
    write(KEYS.categories, categories);
  },
  saveConfig(config: SiteConfig) {
    write(KEYS.config, config);
  },
};

// Helper to invalidate products cache after a mutation.
export function useInvalidateProducts() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
}

// ---- Public path prefix for product URLs (e.g. "produto" -> /produto/slug) ----
export const PATH_PREFIX_QUERY_KEY = ["path-prefix"] as const;

async function fetchPathPrefix(): Promise<string> {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("path_prefix")
      .eq("id", "default")
      .maybeSingle();
    const raw = ((data as { path_prefix?: string | null } | null)?.path_prefix ?? "").trim();
    return sanitizePrefix(raw) || "produto";
  } catch {
    return "produto";
  }
}

export function sanitizePrefix(v: string): string {
  return (v || "")
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9-_]/g, "");
}

export function usePathPrefix(): string {
  const q = useQuery({
    queryKey: PATH_PREFIX_QUERY_KEY,
    queryFn: fetchPathPrefix,
    staleTime: 60_000,
  });
  return q.data ?? "produto";
}

export function useInvalidatePathPrefix() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: PATH_PREFIX_QUERY_KEY });
}

export function productHref(prefix: string, p: Product): string {
  const slugOrId = (p.slug && p.slug.trim()) || p.id;
  return `/${prefix || "produto"}/${slugOrId}`;
}
