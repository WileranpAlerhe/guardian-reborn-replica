export function PromoBanner() {
  const strips = [
    {
      title: "PRATI10",
      desc: "Cupom de 10% OFF na primeira compra",
      cta: "Copiar cupom",
      tone: "cta",
    },
    {
      title: "Frete Grátis",
      desc: "Em compras acima de R$ 100 · Todo Brasil",
      cta: "Ver ofertas",
      tone: "brand",
    },
  ] as const;

  return (
    <section className="px-4 pt-8">
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2">
        {strips.map((s) => (
          <a
            key={s.title}
            href="#ofertas"
            className={`group relative overflow-hidden rounded-3xl p-6 sm:p-8 ${
              s.tone === "cta" ? "gradient-cta" : "gradient-hero"
            }`}
          >
            <div className="relative z-10 text-white">
              <div className="text-3xl font-black tracking-tight sm:text-4xl">{s.title}</div>
              <p className="mt-1 text-sm/relaxed opacity-95">{s.desc}</p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-ink shadow group-hover:scale-105 transition">
                {s.cta} →
              </span>
            </div>
            <span className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <span className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </a>
        ))}
      </div>
    </section>
  );
}
