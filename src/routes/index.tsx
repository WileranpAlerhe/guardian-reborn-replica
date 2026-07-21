import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Benefits } from "@/components/site/Benefits";
import { Section } from "@/components/site/Section";
import { ProductCard } from "@/components/site/ProductCard";
import { Categories } from "@/components/site/Categories";
import { PromoBanner } from "@/components/site/PromoBanner";
import { Reviews } from "@/components/site/Reviews";
import { FAQ } from "@/components/site/FAQ";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { useProducts } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PratiHome — Tudo para sua casa mais bonita e prática" },
      {
        name: "description",
        content:
          "Móveis, decoração, eletroportáteis e utensílios com até 40% OFF, frete grátis acima de R$ 100 e 10x sem juros. Sua casa mais bonita com preços que cabem no bolso.",
      },
      { property: "og:title", content: "PratiHome — Sua casa mais bonita e prática" },
      {
        property: "og:description",
        content: "Móveis, decoração e utensílios com frete grátis e 10x sem juros.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  const products = useProducts()
    .filter((p) => p.active)
    .sort((a, b) => a.order - b.order);

  const flash = products.filter((p) => p.badges.includes("oferta")).slice(0, 8);
  const bestSellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const recommended = products.slice(0, 8);
  const newArrivals = products.filter((p) => p.badges.includes("novo"));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-24">
        <Hero />
        <Benefits />

        <Section id="ofertas" title="Ofertas Relâmpago" icon="flame">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {flash.map((p) => (
              <ProductCard key={p.id} product={p} showTimer />
            ))}
          </div>
        </Section>

        <Categories />

        <Section id="mais-vendidos" title="Mais Vendidos da Semana" icon="trophy">
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
            {bestSellers.map((p, i) => (
              <div key={p.id} className="w-[48%] shrink-0 snap-start sm:w-auto">
                <ProductCard product={p} rank={i + 1} />
              </div>
            ))}
          </div>
        </Section>

        <PromoBanner />

        <Section title="Recomendados para você" icon="sparkles">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>

        {newArrivals.length > 0 && (
          <Section title="Novo Hoje" icon="sparkles">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {newArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Section>
        )}

        <Reviews />
        <FAQ />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
