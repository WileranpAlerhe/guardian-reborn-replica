import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useProductsQuery } from "@/lib/store";

export const Route = createFileRoute("/colecao/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    return {
      meta: [
        { title: `${title} — Coleção PratiHome` },
        {
          name: "description",
          content: `Coleção ${title} da PratiHome: produtos selecionados com frete grátis acima de R$ 100.`,
        },
        { property: "og:title", content: `${title} — PratiHome` },
        {
          property: "og:description",
          content: `Coleção ${title} com curadoria PratiHome.`,
        },
      ],
    };
  },
  component: CollectionPage,
});

type CollectionRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  banner_url: string | null;
};

function CollectionPage() {
  const { slug } = Route.useParams();
  const { products } = useProductsQuery();

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, slug, title, subtitle, banner_url")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as CollectionRow;
    },
  });

  const { data: ids } = useQuery({
    queryKey: ["collection-products", collection?.id],
    enabled: !!collection?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_products")
        .select("product_id")
        .eq("collection_id", collection!.id);
      if (error) throw error;
      return (data ?? []).map((r: { product_id: string }) => r.product_id);
    },
  });

  const list = (ids ?? [])
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p && p.active);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-2.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/" className="hover:text-primary">Coleções</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-ink">{collection?.title ?? slug}</span>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-4">
        <header className="mb-5">
          <h1 className="text-2xl font-black text-ink sm:text-3xl">
            {isLoading ? "Carregando..." : collection?.title ?? slug}
          </h1>
          {collection?.subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{collection.subtitle}</p>
          )}
        </header>

        {list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
            {isLoading ? "Carregando produtos..." : "Nenhum produto nesta coleção."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}