import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, User, MapPin, Heart, X, Phone } from "lucide-react";
import { useState } from "react";
import logoAsset from "@/assets/casaprati-logo-new.png";
import { useCategories, useConfig } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { track } from "@/lib/tracking";

const departments = [
  { label: "Eletrônicos", slug: "eletronicos" },
  { label: "Casa", slug: "casa" },
  { label: "Moda", slug: "moda" },
  { label: "Beleza", slug: "beleza" },
  { label: "Esportes", slug: "esportes" },
  { label: "Pet", slug: "pet" },
  { label: "Ferramentas", slug: "ferramentas" },
  { label: "Automotivo", slug: "automotivo" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const categories = useCategories();
  const config = useConfig();
  const { count, open: openCart } = useCart();
  const navigate = useNavigate();

  const submitSearch = () => {
    const q = search.trim();
    if (!q) return;
    track("search", { search_term: q });
    setOpen(false);
    navigate({ to: "/busca", search: { q } });
  };

  return (
    <>
      {/* Top institutional strip (VTEX pattern) */}
      <div className="hidden bg-ink text-white/90 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px]">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary-glow" />
              Entregamos para todo o Brasil
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-primary-glow" />
              Seg à Sex, 9h às 18h
            </span>
          </div>
          <div className="flex items-center gap-5 font-semibold">
            <a href="#" className="hover:text-primary-glow">Central de Ajuda</a>
            <a href="#" className="hover:text-primary-glow">Meus Pedidos</a>
            <a href="#" className="hover:text-primary-glow">Rastrear Compra</a>
          </div>
        </div>
      </div>

      {/* Promo strip */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-1.5 text-center text-[11px] font-black uppercase tracking-widest">
          Frete grátis acima de R$ 100 • 10x sem juros • Cupom PRATI10
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6 md:py-4">
          {/* Menu (mobile) */}
          <button
            onClick={() => {
              track("menu_click", { menu_type: "hamburger" });
              setOpen(true);
            }}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-muted md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            onClick={() => track("logo_click", { placement: "header" })}
            className="flex shrink-0 items-center"
          >
            <img
              src={logoAsset}
              alt={config.brandName || "CasaPrati"}
              className="h-14 w-auto object-contain sm:h-16 md:h-20"
            />
          </Link>

          {/* Search (desktop) */}
          <div className="ml-2 hidden flex-1 md:block">
            <div className="relative mx-auto max-w-2xl">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitSearch();
                }}
                placeholder="Busque por produtos, marcas, categorias..."
                className="w-full rounded-full border-2 border-primary/20 bg-muted/40 py-3 pl-5 pr-14 text-sm outline-none focus:border-primary focus:bg-white"
              />
              <button
                aria-label="Buscar"
                onClick={submitSearch}
                className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <button
              aria-label="Buscar"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-muted md:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/conta"
              className="hidden h-10 items-center gap-2 rounded-xl px-3 text-ink hover:bg-muted md:inline-flex"
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-bold leading-tight">
                Minha
                <br />
                <span className="text-[10px] font-semibold text-muted-foreground">Conta</span>
              </span>
            </Link>
            <Link
              to="/conta/favoritos"
              aria-label="Favoritos"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-muted md:inline-flex"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <button
              onClick={openCart}
              aria-label="Carrinho"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-muted md:h-11 md:w-11"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-cta px-1 text-[10px] font-black text-cta-foreground shadow">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Departments bar (desktop) */}
        <nav className="hidden border-t border-border bg-white md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
            {departments.map((d) => (
              <Link
                key={d.label}
                to="/categoria/$slug"
                params={{ slug: d.slug }}
                onClick={() =>
                  track("menu_click", { menu_type: "department", menu_label: d.label, link_url: `/categoria/${d.slug}` })
                }
                className="relative py-3 px-3 text-[13px] font-bold text-ink transition hover:text-primary"
              >
                {d.label}
              </Link>
            ))}
            <a
              href="/#ofertas"
              className="ml-auto inline-flex items-center gap-1 rounded-full bg-cta px-4 py-1.5 text-xs font-black uppercase tracking-wide text-cta-foreground shadow-cta hover:bg-cta/90"
            >
              🔥 Super Ofertas
            </a>
          </div>
        </nav>

        {/* Category tabs (mobile) */}
        <nav className="border-t border-border/60 md:hidden">
          <div className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-1.5">
            {departments.slice(0, 6).map((t, i) => (
              <Link
                key={t.label}
                to="/categoria/$slug"
                params={{ slug: t.slug }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Drawer (mobile menu) */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative z-10 flex h-full w-[85%] max-w-sm flex-col bg-background shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-border p-4">
              <img src={logoAsset} alt="CasaPrati" className="h-12 w-auto object-contain" />
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder="Buscar produtos..."
                  className="w-full rounded-xl border-2 border-primary/20 bg-muted/40 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-8">
              <p className="mb-2 mt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Departamentos
              </p>
              <div className="flex flex-col gap-1">
                {departments.map((d) => (
                  <Link
                    key={d.label}
                    to="/categoria/$slug"
                    params={{ slug: d.slug }}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-muted"
                  >
                    {d.label}
                  </Link>
                ))}
              </div>

              {categories.length > 0 && (
                <>
                  <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Categorias
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        to="/categoria/$slug"
                        params={{ slug: c.id }}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-semibold hover:border-primary hover:text-primary"
                      >
                        <span className="text-xl">{c.emoji}</span>
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
