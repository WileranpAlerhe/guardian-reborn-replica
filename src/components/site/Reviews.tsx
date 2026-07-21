import { Star } from "lucide-react";

const reviews = [
  {
    name: "Mariana S.",
    text: "Comprei pelo cupom de 10% e o preço ficou imbatível. Chegou super rápido!",
    rating: 5,
  },
  {
    name: "Rodrigo T.",
    text: "As ofertas são reais mesmo. Já economizei muito comprando por aqui.",
    rating: 5,
  },
  {
    name: "Camila O.",
    text: "Site fácil de usar e produtos bem selecionados. Recomendo demais!",
    rating: 5,
  },
];

export function Reviews() {
  return (
    <section className="px-4 pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3">
          <h2 className="text-base font-black uppercase sm:text-lg">O que dizem sobre nós</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.name} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning" />
                ))}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/90">"{r.text}"</p>
              <p className="mt-3 text-xs font-bold text-muted-foreground">-{r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
