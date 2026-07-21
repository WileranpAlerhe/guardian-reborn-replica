import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { ProductCard } from "@/components/site/ProductCard";
import { useCategories, useProductsQuery } from "@/lib/store";
import { brl } from "@/lib/format";

type Sort = "relevance" | "price-asc" | "price-desc" | "discount" | "rating" | "sold";

export const Route = createFileRoute("/categoria/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    return {
      meta: [
        { title: `${title} — PratiHome` },
        {
          name: "description",
          content: `Ofertas de ${title} na PratiHome com frete grátis acima de R$ 100 e 10x sem juros.`,
        },
        { property: "og:title", content: `${title} — PratiHome` },
        {
          property: "og:description",
          content: `Confira as melhores ofertas de ${title} com cupom e frete grátis.`,
        },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { products, isLoading } = useProductsQuery();
  const categories = useCategories();
  const category = categories.find((c) => c.id === slug);

  const catProducts = useMemo(
    () => products.filter((p) => p.active && p.category === slug),
    [products, slug],
  );

  const priceRange = useMemo(() => {
    if (catProducts.length === 0) return { min: 0, max: 1000 };
    const prices = catProducts.map((p) => p.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [catProducts]);

  const [sort, setSort] = useState<Sort>("relevance");
  const [minRating, setMinRating] = useState(0);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 16;

  const filtered = useMemo(() => {
    let list = catProducts.slice();
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    if (onlyDiscount) list = list.filter((p) => p.oldPrice > p.price);
    if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice);
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        list.sort(
          (a, b) => (b.oldPrice - b.price) / b.oldPrice - (a.oldPrice - a.price) / a.oldPrice,
        );
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "sold":
        list.sort((a, b) => b.sold - a.sold);
        break;
      default:
        list.sort((a, b) => a.order - b.order);
    }
    return list;
  }, [catProducts, sort, minRating, onlyDiscount, maxPrice]);

  useEffect(() => {
    setPage(1);
  }, [slug, sort, minRating, onlyDiscount, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: category?.name ?? slug,
        item: `/categoria/${slug}`,
      },
    ],
  };

  const clearFilters = () => {
    setMinRating(0);
    setOnlyDiscount(false);
    setMaxPrice(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-2.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-ink">{category?.name ?? slug}</span>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-4">
        <header className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-ink sm:text-2xl">
              {category?.emoji} {category?.name ?? slug}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "produto" : "produtos"} encontrados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-bold hover:border-primary lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-border bg-white px-3 py-2 text-xs font-bold outline-none focus:border-primary"
            >
              <option value="relevance">Relevância</option>
              <option value="sold">Mais vendidos</option>
              <option value="rating">Melhor avaliação</option>
              <option value="discount">Maior desconto</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
          <FiltersPanel
            className="hidden lg:block"
            priceRange={priceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            onlyDiscount={onlyDiscount}
            setOnlyDiscount={setOnlyDiscount}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            clearFilters={clearFilters}
          />

          <div>
            {isLoading && catProducts.length === 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-shimmer rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {paginated.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <nav className="mt-6 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                    >
                      Próxima
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <aside className="relative z-10 ml-auto flex h-full w-[85%] max-w-sm flex-col bg-background shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-sm font-black">Filtros</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FiltersPanel
                priceRange={priceRange}
                minRating={minRating}
                setMinRating={setMinRating}
                onlyDiscount={onlyDiscount}
                setOnlyDiscount={setOnlyDiscount}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                clearFilters={clearFilters}
              />
            </div>
            <div className="border-t border-border p-4">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-xl bg-primary py-3 text-sm font-black uppercase tracking-wide text-primary-foreground shadow-cta"
              >
                Ver {filtered.length} produtos
              </button>
            </div>
          </aside>
        </div>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
}

function FiltersPanel(props: {
  className?: string;
  priceRange: { min: number; max: number };
  minRating: number;
  setMinRating: (v: number) => void;
  onlyDiscount: boolean;
  setOnlyDiscount: (v: boolean) => void;
  maxPrice: number | null;
  setMaxPrice: (v: number | null) => void;
  clearFilters: () => void;
}) {
  const {
    className,
    priceRange,
    minRating,
    setMinRating,
    onlyDiscount,
    setOnlyDiscount,
    maxPrice,
    setMaxPrice,
    clearFilters,
  } = props;
  return (
    <aside className={className ?? ""}>
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider">Filtros</h3>
          <button
            onClick={clearFilters}
            className="text-[11px] font-bold text-primary hover:underline"
          >
            Limpar
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Preço máximo: {maxPrice != null ? brl(maxPrice) : "—"}
          </label>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={maxPrice ?? priceRange.max}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
            <span>{brl(priceRange.min)}</span>
            <span>{brl(priceRange.max)}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Avaliação mínima
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[0, 3, 4, 4.5].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                  minRating === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white text-ink hover:border-primary"
                }`}
              >
                {r === 0 ? "Todas" : `${r}★+`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <input
              type="checkbox"
              checked={onlyDiscount}
              onChange={(e) => setOnlyDiscount(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Somente com desconto
          </label>
        </div>
      </div>
    </aside>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-white p-10 text-center">
      <p className="text-sm font-bold text-ink">Nenhum produto encontrado</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Ajuste os filtros ou explore outras categorias.
      </p>
      <button
        onClick={onClear}
        className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-wide text-primary-foreground shadow-cta"
      >
        Limpar filtros
      </button>
    </div>
  );
}
