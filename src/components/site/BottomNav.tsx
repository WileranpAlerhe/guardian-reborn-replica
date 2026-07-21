import { Home, Grid3x3, Search, ShoppingCart, User } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export function BottomNav() {
  const { count, open } = useCart();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const isActive = (p: string) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p);

  const submit = () => {
    const term = q.trim();
    if (!term) return;
    setSearchOpen(false);
    setQ("");
    navigate({ to: "/busca", search: { q: term } });
  };

  const item = (active: boolean) =>
    `flex flex-col items-center gap-1 py-2 text-[10.5px] font-bold transition ${
      active ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-5">
          <Link to="/" className={item(isActive("/"))}>
            <Home className="h-5 w-5" />
            Início
          </Link>
          <a href="/#categorias" className={item(false)}>
            <Grid3x3 className="h-5 w-5" />
            Categorias
          </a>
          <button
            onClick={open}
            className="relative flex flex-col items-center gap-1 py-1 text-[10.5px] font-bold"
          >
            <span className="-mt-6 grid h-12 w-12 place-items-center rounded-full bg-cta shadow-cta">
              <ShoppingCart className="h-5 w-5 text-cta-foreground" />
              {count > 0 && (
                <span className="absolute right-4 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-black text-white">
                  {count}
                </span>
              )}
            </span>
            <span className="text-ink">Carrinho</span>
          </button>
          <button onClick={() => setSearchOpen(true)} className={item(isActive("/busca"))}>
            <Search className="h-5 w-5" />
            Buscar
          </button>
          <Link to="/conta" className={item(isActive("/conta"))}>
            <User className="h-5 w-5" />
            Conta
          </Link>
        </div>
      </nav>

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
          <div
            className="relative z-10 mt-0 w-full bg-white p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Buscar produtos..."
                className="w-full rounded-xl border-2 border-primary/20 bg-muted/40 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
