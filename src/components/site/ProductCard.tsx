import { Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { trackSelectItem } from "@/lib/tracking";
import type { Product } from "@/data/seed";
import { brl, discountPct } from "@/lib/format";
import { usePathPrefix } from "@/lib/store";
import { useCart } from "@/lib/cart";

interface Props {
  product: Product;
  rank?: number;
  showTimer?: boolean;
}

export function ProductCard({ product, rank }: Props) {
  const prefix = usePathPrefix();
  const slug = (product.slug && product.slug.trim()) || product.id;
  const disc = discountPct(product.oldPrice, product.price);
  const { addItem } = useCart();
  const installment = product.price / 10;
  const hasOld = product.oldPrice > product.price;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover">
      {/* Badges (VTEX highlight cluster) */}
      <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col gap-1">
        {disc > 0 && (
          <span className="rounded-md bg-cta px-2 py-0.5 text-[10px] font-black leading-none text-cta-foreground shadow">
            -{disc}%
          </span>
        )}
        {rank !== undefined && rank <= 3 && (
          <span className="rounded-md bg-ink px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            Top {rank}
          </span>
        )}
      </div>

      <Link
        to="/$prefix/$slug"
        params={{ prefix, slug }}
        onClick={() => trackSelectItem(product, "card_image")}
        className="relative aspect-square overflow-hidden bg-white"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          width={400}
          height={400}
          onError={(e) => {
            const el = e.currentTarget;
            if (el.dataset.fallback) return;
            el.dataset.fallback = "1";
            el.src =
              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect fill='%23f4f4f5' width='400' height='400'/><text x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%23a1a1aa' text-anchor='middle' dominant-baseline='middle'>Imagem indisponível</text></svg>";
          }}
          className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Brand line (VTEX-style) */}
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          CasaPrati
        </div>

        <h3 className="line-clamp-5 min-h-[3.6rem] text-[13px] font-medium leading-tight text-ink group-hover:text-primary">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 text-[11px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.round(product.rating) ? "fill-warning text-warning" : "text-muted opacity-40"
              }`}
            />
          ))}
          <span className="ml-0.5 font-semibold text-muted-foreground">
            ({product.sold.toLocaleString("pt-BR")})
          </span>
        </div>

        {/* Price block VTEX: De / Por / parcelamento */}
        <div className="mt-1">
          <div className="min-h-[14px] text-[11px] leading-none text-muted-foreground">
            {hasOld && (
              <>
                de <span className="line-through">{brl(product.oldPrice)}</span>
              </>
            )}
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">por</span>
            <span className="text-xl font-black leading-none text-ink">{brl(product.price)}</span>
          </div>
          <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
            em até <strong className="font-bold text-ink">10x de {brl(installment)}</strong> sem juros
          </p>
          <p className="mt-1 text-[10.5px] font-bold text-success">Frete grátis acima de R$ 100</p>
        </div>

        <button
          onClick={() => {
            trackSelectItem(product, "card_cta");
            addItem(product);
          }}
          className="mt-2 inline-flex items-center justify-center rounded-md bg-cta px-3 py-2.5 text-[12px] font-black uppercase tracking-wider text-cta-foreground shadow-cta transition hover:bg-cta/90"
        >
          Comprar
        </button>
      </div>
    </article>
  );
}
