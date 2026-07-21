import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Flame,
  Heart,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
  Truck,
  Timer,
  Store,
  Ticket,
  Wallet,
  CheckCircle2,
  X,
} from "lucide-react";
import { usePersistentCountdown } from "@/lib/useCountdown";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { ProductCard } from "@/components/site/ProductCard";
import { Section } from "@/components/site/Section";
import { useProductsQuery } from "@/lib/store";
import { brl, compact, discountPct } from "@/lib/format";
import { track, trackViewItem } from "@/lib/tracking";
import { useCart } from "@/lib/cart";
import type { Product } from "@/data/seed";
import { productDetails } from "@/data/product-details";


export const Route = createFileRoute("/produto/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Produto ${params.id} — PratiHome` },
      {
        name: "description",
        content:
          "Confira este produto na PratiHome com frete grátis acima de R$ 100, 10x sem juros e compra 100% segura.",
      },
      { property: "og:title", content: "PratiHome — Oferta imperdível" },
      {
        property: "og:description",
        content: "Cupom aplicado, envio rápido e compra segura.",
      },
    ],
  }),
  component: ProductDetail,
  notFoundComponent: NotFoundView,
});

export function NotFoundView() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-ink">Produto não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O produto que você procura pode ter saído do ar.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground shadow-cta"
        >
          Voltar para ofertas
        </Link>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}

function ProductDetail() {
  const { id } = Route.useParams();
  const { products: all, isLoading } = useProductsQuery();
  const product = useMemo(
    () => all.find((p) => (p.slug && p.slug === id) || p.id === id),
    [all, id],
  );

  if (!product) {
    if (isLoading) return <LoadingView />;
    throw notFound();
  }

  return <Detail product={product} all={all} />;
}

export function LoadingView() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Carregando oferta...</p>
      </div>
    </div>
  );
}

export function Detail({ product, all }: { product: Product; all: Product[] }) {
  const disc = discountPct(product.oldPrice, product.price);
  const timer = usePersistentCountdown(`detail:${product.id}`, 3600);
  const installments = (product.price / 10).toFixed(2).replace(".", ",");
  const cashback = (product.price * 0.05).toFixed(2).replace(".", ",");
  const { addItem } = useCart();
  const navigate = useNavigate();
  const related = all
    .filter((p) => p.id !== product.id && p.active)
    .sort((a, b) => (a.category === product.category ? -1 : 1))
    .slice(0, 8);

  // Distinguish voltage variants (110V / 220V / Bivolt) from color/image variants
  const isVoltageVariant = (name: string) => /^\s*(110|127|220)\s*v\b|bivolt/i.test(name);
  const voltageVariants = product.variants?.filter((v) => isVoltageVariant(v.name)) ?? [];
  const imageVariants = product.variants?.filter((v) => !isVoltageVariant(v.name)) ?? [];
  const hasVoltage = voltageVariants.length > 0;

  const [selectedVariant, setSelectedVariant] = useState(imageVariants[0]?.id ?? null);
  const [selectedVoltage, setSelectedVoltage] = useState<string | null>(
    hasVoltage ? voltageVariants[0].id : null,
  );

  // Gallery: when product.images is defined, use it as the authoritative
  // gallery (the main product.image is a default cover that would otherwise
  // add an extra thumbnail). Fallback to product.image when no gallery.
  const galleryImages = useMemo(() => {
    const list = product.images && product.images.length
      ? product.images
      : [product.image];
    return Array.from(new Set(list.filter(Boolean)));
  }, [product.image, product.images]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const currentImage =
    imageVariants.find((v) => v.id === selectedVariant)?.image ??
    galleryImages[activeImageIdx] ??
    product.image;
  const currentVariantName = imageVariants.find((v) => v.id === selectedVariant)?.name;
  const selectedVoltageName = voltageVariants.find((v) => v.id === selectedVoltage)?.name;

  const cartVariantLabel = [currentVariantName, selectedVoltageName].filter(Boolean).join(" · ") || undefined;

  const handleBuyNow = (placement: string) => {
    if (hasVoltage && !selectedVoltage) {
      // Should never happen since we default to first, but guard anyway.
      return;
    }
    track("begin_checkout", {
      ecommerce: {
        currency: "BRL",
        value: product.price,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: 1 }],
      },
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: product.price,
      voltage: selectedVoltageName,
      placement,
    });
    addItem(product, 1, cartVariantLabel);
    navigate({ to: "/checkout" });
  };



  // Show sticky CTA only after the user scrolls far down the page
  const [showStickyCta, setShowStickyCta] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    trackViewItem(product);
  }, [product.id]);

  const share = async () => {
    track("share_click", { product_id: product.id, product_name: product.name, method: "native" });
    if (typeof navigator === "undefined") return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Confere essa oferta: ${product.name} por ${brl(product.price)}`,
          url: window.location.href,
        });
      }
    } catch {
      /* noop */
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb / back bar */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-semibold text-ink hover:bg-muted/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
          <div className="flex min-w-0 items-center gap-1 text-muted-foreground">
            <span className="shrink-0">Ofertas</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="shrink-0 capitalize">{product.category}</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate font-medium text-ink">{product.name}</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-48 pt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8 lg:pb-16">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-white shadow-card">
            <div className="absolute right-3 top-3 z-10 flex gap-2">
              <button
                aria-label="Favoritar"
                onClick={() => track("favorite_click", { product_id: product.id, product_name: product.name })}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow hover:text-primary"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                aria-label="Compartilhar"
                onClick={share}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            <img
              src={currentImage}
              alt={product.name}
              className="aspect-square w-full object-contain p-6"
              onError={(e) => {
                const el = e.currentTarget;
                if (el.dataset.fallback) return;
                el.dataset.fallback = "1";
                el.src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect fill='%23f4f4f5' width='400' height='400'/><text x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%23a1a1aa' text-anchor='middle' dominant-baseline='middle'>Imagem indisponível</text></svg>";
              }}
            />
          </div>

          {/* Image gallery thumbnails */}
          {galleryImages.length > 1 && imageVariants.length === 0 && (
            <div className="mt-3 -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {galleryImages.map((src, i) => {
                const active = i === activeImageIdx;
                return (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImageIdx(i)}
                    className={`shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-white transition ${
                      active ? "border-primary shadow-card" : "border-border hover:border-primary/40"
                    }`}
                    aria-label={`Foto ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Foto ${i + 1} - ${product.name}`}
                      className="h-16 w-16 object-contain p-1 sm:h-[72px] sm:w-[72px]"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {imageVariants.length > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
                Cor: <span className="font-bold text-ink">{currentVariantName}</span>
              </div>
              <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {imageVariants.map((v) => {
                  const active = v.id === selectedVariant;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(v.id);
                        track("variant_select", {
                          product_id: product.id,
                          variant_id: v.id,
                          variant_name: v.name,
                        });
                      }}
                      className="group flex w-[68px] shrink-0 snap-start flex-col items-center gap-1 sm:w-[76px]"
                      aria-label={v.name}
                      title={v.name}
                    >
                      <div
                        className={`overflow-hidden rounded-xl border-2 bg-white transition ${
                          active
                            ? "border-primary shadow-card"
                            : "border-border group-hover:border-primary/40"
                        }`}
                      >
                        <img
                          src={v.image}
                          alt={v.name}
                          className="h-16 w-16 object-contain p-1 sm:h-[72px] sm:w-[72px]"
                        />
                      </div>
                      <span
                        className={`w-full truncate text-center text-[10px] font-semibold leading-tight sm:text-[11px] ${
                          active ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {v.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Buy box */}
        <aside className="mt-5 lg:mt-0">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-card lg:sticky lg:top-32">
            {/* Voltage + trust unified inside the buy-box (mobile & desktop) */}
            {hasVoltage && (
              <div className="-mx-4 -mt-4 mb-4 overflow-hidden rounded-t-3xl border-b border-border">
                <VoltageBlock
                  voltageVariants={voltageVariants}
                  selectedVoltage={selectedVoltage}
                  selectedVoltageName={selectedVoltageName}
                  onSelect={(v) => {
                    setSelectedVoltage(v.id);
                    track("variant_select", {
                      product_id: product.id,
                      variant_id: v.id,
                      variant_name: v.name,
                    });
                  }}
                />
                <TrustStrip />
              </div>
            )}
            {!hasVoltage && (
              <div className="-mx-4 -mt-4 mb-4 overflow-hidden rounded-t-3xl border-b border-border">
                <TrustStrip />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
              {product.badges.includes("mais-vendido") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-primary">
                  <Flame className="h-3 w-3" /> Mais vendido
                </span>
              )}
              {product.badges.includes("novo") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-success">
                  <Sparkles className="h-3 w-3" /> Novo
                </span>
              )}
              {product.badges.includes("destaque") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                  <Star className="h-3 w-3 fill-primary" /> Destaque
                </span>
              )}
            </div>

            <h1 className="mt-2 text-lg font-black leading-tight text-ink sm:text-xl">
              {product.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-warning">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? "fill-warning" : "opacity-30"}`}
                  />
                ))}
                <span className="ml-1 font-bold text-ink">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {compact(product.sold)} vendidos
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-success font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Em estoque
              </span>
            </div>

            {/* Price block — VTEX style */}
            <div className="mt-4 rounded-2xl border border-border bg-white p-4">
              {product.oldPrice > product.price && (
                <div className="text-xs text-muted-foreground">
                  De <span className="line-through">{brl(product.oldPrice)}</span>
                </div>
              )}
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="text-[13px] font-semibold text-muted-foreground">Por</span>
                <span className="text-3xl font-black leading-none text-ink sm:text-4xl">
                  {brl(product.price)}
                </span>
                {disc > 0 && (
                  <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-[11px] font-black text-success">
                    -{disc}%
                  </span>
                )}
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">
                no PIX ou boleto
              </div>
              <div className="mt-2 border-t border-border pt-2 text-[12px] text-ink">
                ou <span className="font-bold">10x de R$ {installments}</span>
                <span className="text-muted-foreground"> sem juros no cartão</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                <Wallet className="h-3.5 w-3.5" /> R$ {cashback} de cashback nessa compra
              </div>
            </div>




            {/* CTA "Comprar agora" — adiciona ao carrinho e vai pro checkout */}
            <button
              type="button"
              onClick={() => handleBuyNow("buybox_cta")}
              className="mt-3 flex w-full items-center justify-center whitespace-nowrap rounded-2xl bg-cta px-4 py-3.5 text-sm font-black uppercase tracking-wide text-cta-foreground shadow-cta transition hover:bg-cta/90 active:scale-[0.98]"
            >
              Comprar agora
            </button>


            {/* Coupon */}
            {product.couponText && (
              <button
                type="button"
                onClick={() => {
                  track("coupon_click", {
                    product_id: product.id,
                    coupon: product.couponText,
                  });
                  if (typeof navigator !== "undefined" && navigator.clipboard && product.couponText) {
                    navigator.clipboard.writeText(product.couponText).catch(() => {});
                  }
                }}
                className="mt-3 flex w-full items-start rounded-xl border border-dashed border-primary/40 bg-warning/10 p-3 text-left hover:bg-warning/20"
              >
                <div className="text-xs">
                  <div className="flex items-center gap-1 font-black text-primary">
                    <Ticket className="h-3.5 w-3.5" /> Cupom PRATI10 ativo
                  </div>
                  <div className="text-ink">10% OFF já aplicado — válido só na 1ª compra</div>
                </div>
              </button>
            )}

            {/* Timer */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/30 bg-gradient-to-r from-primary to-primary-glow px-3 py-2 text-primary-foreground shadow-cta">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
                <Timer className="h-3.5 w-3.5" /> Oferta termina em
              </div>
              <div className="flex items-center gap-1 tabular-nums">
                <span className="rounded-md bg-white/25 px-1.5 py-0.5 text-sm font-black leading-none">{timer.m}</span>
                <span className="text-sm font-black leading-none">:</span>
                <span className="rounded-md bg-white/25 px-1.5 py-0.5 text-sm font-black leading-none">{timer.s}</span>
              </div>
            </div>

            {/* Stock urgency */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-primary">Estoque quase acabando</span>
                <span className="text-muted-foreground">restam poucas unidades</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[18%] gradient-brand" />
              </div>
            </div>

            <div className="mt-3 hidden text-center text-[11px] text-muted-foreground lg:block">
              <ShieldCheck className="mr-1 inline h-3 w-3 text-success" />
              Checkout próprio · pagamento PIX processado por gateway oficial
            </div>
          </div>
        </aside>

        {/* Rich product content — same structure para TODOS os produtos */}
        <section className="col-span-full mt-6 grid gap-4 lg:grid-cols-2">
          <ProductRichContent product={product} />
          <ProductReviews product={product} />
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <div className="col-span-full mt-4">
            <Section title="Você também vai gostar" icon="sparkles">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {related.slice(0, 8).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </Section>
          </div>
        )}
      </main>

      {/* Sticky mobile CTA — flutuante acima da BottomNav, estilo VTEX */}
      <div
        className={`fixed inset-x-0 bottom-[76px] z-40 px-3 transition-all duration-300 lg:hidden ${
          showStickyCta
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0"
        }`}
        aria-hidden={!showStickyCta}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 rounded-2xl border border-border bg-white/98 p-2 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur">
          <img
            src={currentImage}
            alt=""
            aria-hidden
            className="h-11 w-11 shrink-0 rounded-xl border border-border bg-white object-contain p-1"
          />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {product.oldPrice > product.price ? `De ${brl(product.oldPrice)}` : "Por"}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black leading-none text-ink">
                {brl(product.price)}
              </span>
              {disc > 0 && (
                <span className="rounded bg-success/15 px-1 py-0.5 text-[9px] font-black text-success">
                  -{disc}%
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleBuyNow("sticky_cta")}
            className="flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-cta px-4 py-3 text-[13px] font-black uppercase tracking-wide text-cta-foreground shadow-cta transition hover:bg-cta/90 active:scale-[0.98]"
          >
            Comprar agora
          </button>

        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}

type VoltageVariant = { id: string; name: string };

function VoltageBlock({
  voltageVariants,
  selectedVoltage,
  selectedVoltageName,
  onSelect,
}: {
  voltageVariants: VoltageVariant[];
  selectedVoltage: string | null;
  selectedVoltageName: string | undefined;
  onSelect: (v: VoltageVariant) => void;
}) {
  return (
    <div className="border-b border-border bg-card p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
            </svg>
          </span>
          <span className="text-[11px] font-black uppercase tracking-wider text-ink">
            Voltagem
          </span>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-black text-primary">
          {selectedVoltageName ?? "Selecione"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {voltageVariants.map((v) => {
          const active = v.id === selectedVoltage;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              aria-pressed={active}
              className={`relative flex items-center justify-center rounded-xl border-2 px-3 py-2.5 text-sm font-black uppercase tracking-wide transition ${
                active
                  ? "border-primary bg-primary/5 text-ink"
                  : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-ink"
              }`}
            >
              <span>{v.name}</span>
              {active && (
                <CheckCircle2 className="absolute right-2 top-2 h-3.5 w-3.5 text-primary" />
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 flex items-start gap-1 text-[11px] leading-snug text-muted-foreground">
        <ShieldCheck className="mt-[1px] h-3 w-3 shrink-0 text-success" />
        Confira a voltagem da sua tomada antes de finalizar a compra.
      </p>
    </div>
  );
}

function TrustStrip() {
  const items = [
    { icon: <Truck className="h-4 w-4" />, title: "Envio 24h" },
    { icon: <ShieldCheck className="h-4 w-4" />, title: "Pagamento seguro" },
    { icon: <BadgeCheck className="h-4 w-4" />, title: "Loja oficial" },
  ];
  return (
    <div className="grid grid-cols-3 divide-x divide-border bg-card">
      {items.map((it) => (
        <div key={it.title} className="flex flex-col items-center gap-1.5 px-2 py-3 text-center">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            {it.icon}
          </span>
          <div className="text-[11px] font-bold leading-tight text-ink">{it.title}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Conteúdo rico do produto (padrão Shopee) — igual pra todos
   ============================================================ */

function ProductRichContent({ product }: { product: Product }) {
  const details = productDetails[product.id];

  const description =
    details?.description ??
    product.description ??
    `${product.name} é um produto de alta qualidade escolhido a dedo pela nossa curadoria. Com desempenho superior e ótimo custo-benefício, foi aprovado por milhares de clientes em todo o Brasil.`;

  const benefits = details?.benefits ?? [
    "Produto de qualidade selecionado pela nossa curadoria",
    "Entrega rápida para todo o Brasil",
    "Nota fiscal e garantia inclusas",
    "Ótimo custo-benefício",
  ];

  const specs: [string, string][] =
    details?.specs ?? [
      ["Marca", product.name.split(" ")[0] ?? "Original"],
      ["Categoria", product.category ?? "Geral"],
      ["Garantia", "12 meses"],
      ["Origem", "Nacional / Importado"],
    ];

  const recommendedFor =
    details?.recommendedFor ??
    "Uso pessoal, presente e dia a dia de quem procura um produto prático e confiável.";

  const advantages =
    details?.advantages ?? [
      "Preço promocional com cupom aplicado",
      "Compra 100% segura",
      "Envio expresso com código de rastreio",
      "Suporte pós-venda dedicado",
    ];

  const faq =
    details?.faq ?? [
      {
        q: "O produto é original?",
        a: "Sim, trabalhamos apenas com fornecedores oficiais e todos os produtos possuem nota fiscal.",
      },
      {
        q: "Quanto tempo demora a entrega?",
        a: "Entrega expressa para todo o Brasil. Após a confirmação do pagamento, o pedido é despachado em até 24h úteis com código de rastreio.",
      },
      {
        q: "Posso trocar ou devolver?",
        a: "Sim. Você tem 7 dias corridos após o recebimento para trocar ou devolver conforme o Código de Defesa do Consumidor.",
      },
      {
        q: "Qual a garantia?",
        a: "Garantia de 12 meses contra defeitos de fabricação.",
      },
    ];

  const boxContents = details?.boxContents ?? [
    `1x ${product.name}`,
    "Manual / instruções conforme fabricante",
    "Nota fiscal eletrônica",
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-card lg:col-span-2">
      <h2 className="text-sm font-black uppercase tracking-wide text-primary">
        Descrição Completa
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/90">{description}</p>

      <h3 className="mt-5 text-sm font-black text-ink">Principais Benefícios</h3>
      <ul className="mt-2 space-y-1.5 text-sm text-ink/90">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-5 text-sm font-black text-ink">Especificações Técnicas</h3>
      <div className="mt-2 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-xs">
          <tbody>
            {specs.map(([k, v], i) => (
              <tr key={k} className={i % 2 === 0 ? "bg-muted/40" : "bg-card"}>
                <td className="w-[42%] px-3 py-2 font-semibold text-ink">{k}</td>
                <td className="px-3 py-2 text-ink/80">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-5 text-sm font-black text-ink">Recomendado Para</h3>
      <p className="mt-1 text-sm text-ink/90">{recommendedFor}</p>

      <h3 className="mt-5 text-sm font-black text-ink">Vantagens</h3>
      <ul className="mt-2 space-y-1.5 text-sm text-ink/90">
        {advantages.map((t) => (
          <li key={t} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-5 text-sm font-black text-ink">Perguntas Frequentes</h3>
      <div className="mt-2 space-y-2 text-sm">
        {faq.map((it) => (
          <div key={it.q} className="rounded-xl border border-border bg-muted/30 p-3">
            <div className="text-xs font-black text-ink">{it.q}</div>
            <p className="mt-1 text-xs text-ink/80">{it.a}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-5 text-sm font-black text-ink">Informações de Envio</h3>
      <ul className="mt-2 space-y-1.5 text-sm text-ink/90">
        {[
          "Envio para todo o Brasil via Correios e transportadoras",
          "Código de rastreio enviado por e-mail e WhatsApp",
          "Embalagem reforçada para proteger o produto",
          "Frete grátis em compras acima do valor promocional",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-5 text-sm font-black text-ink">Conteúdo da Embalagem</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink/90">
        {boxContents.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}


/* ============================================================
   Bloco de Avaliações (padrão Shopee) — igual pra todos
   ============================================================ */

function ProductReviews({ product }: { product: Product }) {
  const [showAll, setShowAll] = useState(false);
  const total = Math.max(120, Math.round(product.sold * 0.28));
  const dist = [
    { stars: 5, pct: 82 },
    { stars: 4, pct: 12 },
    { stars: 3, pct: 4 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ];

  const details = productDetails[product.id];
  const [lightbox, setLightbox] = useState<string | null>(null);

  const defaultReviews = [
    { n: "João P.", s: 5, t: "Chegou super rápido, muito bem embalado. Atendeu tudo que eu esperava. Recomendo!", withPhoto: true },
    { n: "Maria C.", s: 5, t: "Comprei com o cupom e valeu muito a pena. Entrega dentro do prazo prometido." },
    { n: "Rafael T.", s: 5, t: "Estou usando há duas semanas e é excelente. Ótimo acabamento.", withPhoto: true },
    { n: "Juliana P.", s: 4, t: "Muito bom pelo preço. Chegou certinho, embalagem lacrada, produto novo." },
    { n: "Carlos S.", s: 5, t: "Perfeito, superou minhas expectativas. Compra segura e envio rápido." },
  ];

  // Distribute realistic "days ago" — most recent first, mixing hoje/ontem/dias/semanas
  const dayPattern = [0, 0, 1, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 17, 20, 24, 28, 33, 40, 48, 55, 62, 70, 80, 92];

  const allReviews = (details?.reviews ?? defaultReviews).map((r, i) => ({
    ...r,
    photo: r.photo ?? (r.withPhoto ? product.image : undefined),
    daysAgo: r.daysAgo ?? dayPattern[i] ?? 30 + i,
  }));

  const reviews = showAll ? allReviews : allReviews.slice(0, 5);

  const formatDate = (daysAgo: number) => {
    if (daysAgo === 0) return "Hoje";
    if (daysAgo === 1) return "Ontem";
    if (daysAgo < 7) return `Há ${daysAgo} dias`;
    if (daysAgo < 14) return "Há 1 semana";
    if (daysAgo < 30) return `Há ${Math.round(daysAgo / 7)} semanas`;
    if (daysAgo < 60) return "Há 1 mês";
    return `Há ${Math.round(daysAgo / 30)} meses`;
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-card lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-black uppercase tracking-wide text-primary">
          Avaliações e Opiniões
        </h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Mostrando as mais recentes
        </span>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-3 sm:flex-col sm:items-start">
          <div className="text-5xl font-black leading-none text-ink">
            {product.rating.toFixed(1)}
          </div>
          <div>
            <div className="flex text-warning">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-warning" : "opacity-30"}`}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              {compact(total)} avaliações
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {dist.map((d) => (
            <div key={d.stars} className="flex items-center gap-2 text-[11px]">
              <span className="w-6 shrink-0 font-semibold text-ink">{d.stars}★</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-warning" style={{ width: `${d.pct}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {reviews.map((r, idx) => (
          <div key={`${r.n}-${idx}`} className="rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary">
                {r.n[0]}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink">{r.n}</div>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-warning">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < r.s ? "fill-warning" : "opacity-30"}`}
                      />
                    ))}
                  </div>
                  <span className="whitespace-nowrap text-[10px] text-muted-foreground">· {formatDate(r.daysAgo)}</span>
                </div>
              </div>
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                <BadgeCheck className="h-3 w-3" /> Compra verificada
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink/90">{r.t}</p>
            {r.photo && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setLightbox(r.photo!)}
                  className="overflow-hidden rounded-lg border border-border transition hover:opacity-80"
                  aria-label="Ampliar foto da avaliação"
                >
                  <img
                    src={r.photo}
                    alt="Foto da avaliação"
                    className="h-16 w-16 object-cover"
                  />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {allReviews.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 w-full rounded-xl border border-border bg-muted/40 py-2 text-xs font-bold text-ink hover:bg-muted"
        >
          {showAll ? "Ver menos avaliações" : `Ver mais ${allReviews.length - 5} avaliações`}
        </button>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Foto da avaliação ampliada"
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}


