import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a PratiHome — Curadoria de produtos para casa" },
      {
        name: "description",
        content:
          "Conheça a PratiHome: curadoria de produtos para casa, moda e beleza com qualidade garantida e entrega para todo o Brasil.",
      },
      { property: "og:title", content: "Sobre a PratiHome" },
      {
        property: "og:description",
        content:
          "Curadoria de produtos com qualidade garantida, envio rápido e atendimento humano.",
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black text-ink">Sobre a PratiHome</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          A PratiHome nasceu para tornar a casa mais bonita, prática e aconchegante.
          Curamos produtos com qualidade garantida, preços honestos e envio rápido
          para todo o Brasil.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Curadoria", d: "Produtos testados e selecionados um a um." },
            { t: "Preço justo", d: "Ofertas verdadeiras, cupons transparentes." },
            { t: "Suporte real", d: "Atendimento humano por e-mail e WhatsApp." },
          ].map((b) => (
            <div key={b.t} className="rounded-2xl border border-border bg-white p-5">
              <p className="text-sm font-black text-ink">{b.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}