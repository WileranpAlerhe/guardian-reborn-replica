import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { Search as SearchIcon } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { ProductCard } from "@/components/site/ProductCard";
import { useCategories, useProductsQuery } from "@/lib/store";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/busca")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Buscar produtos — PratiHome" },
      {
        name: "description",
        content: "Encontre produtos, marcas e categorias na PratiHome.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SearchPage,
});

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function SearchPage() {
  const { q } = Route.useSearch();
  const { products, isLoading } = useProductsQuery();
  const categories = useCategories();

  const results = useMemo(() => {
    const query = normalize(q).trim();
    if (!query) return [];
    return products
      .filter((p) => p.active)
      .filter((p) => {
        const hay = normalize(
          `${p.name} ${p.category} ${p.description ?? ""} ${p.badges.join(" ")}`,
        );
        return query
          .split(/\s+/)
          .filter(Boolean)
          .every((word) => hay.includes(word));
      });
  }, [q, products]);

  const suggestedCategories = categories.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SearchIcon className="h-3.5 w-3.5" />
            {q ? (
              <span>
                Resultados para <strong className="text-ink">"{q}"</strong>
              </span>
            ) : (
              <span>Digite algo na busca para começar</span>
            )}
          </div>
          <h1 className="mt-1 text-xl font-black text-ink sm:text-2xl">
            {q ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"}` : "Buscar"}
          </h1>
        </div>

        {q && results.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {q && results.length === 0 && !isLoading && (
          <div className="rounded-3xl border border-dashed border-border bg-white p-8 text-center">
            <p className="text-sm font-bold text-ink">
              Não encontramos nada para "{q}"
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tente termos mais curtos, verifique a ortografia ou explore uma categoria.
            </p>
            <div className="mt-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Categorias sugeridas
              </p>
              <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2">
                {suggestedCategories.map((c) => (
                  <Link
                    key={c.id}
                    to="/categoria/$slug"
                    params={{ slug: c.id }}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-bold hover:border-primary hover:text-primary"
                  >
                    <span>{c.emoji}</span> {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {!q && (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Explore por categoria
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {suggestedCategories.map((c) => (
                <Link
                  key={c.id}
                  to="/categoria/$slug"
                  params={{ slug: c.id }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-5 shadow-card hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-card-hover"
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-sm font-bold">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
