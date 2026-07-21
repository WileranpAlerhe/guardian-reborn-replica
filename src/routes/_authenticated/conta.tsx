import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({ meta: [{ title: "Minha Conta — PratiHome" }, { name: "robots", content: "noindex" }] }),
  component: ContaLayout,
});

function ContaLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setName(data.user?.user_metadata?.full_name || data.user?.email || "Cliente");
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const isRoot = location.pathname === "/conta" || location.pathname === "/conta/";

  const items = [
    { to: "/conta", label: "Visão geral", icon: User, exact: true },
    { to: "/conta/pedidos", label: "Meus pedidos", icon: Package },
    { to: "/conta/enderecos", label: "Endereços", icon: MapPin },
    { to: "/conta/favoritos", label: "Favoritos", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <h1 className="mb-6 text-2xl font-black md:text-3xl">Olá, {name.split(" ")[0]} 👋</h1>
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl bg-white p-3 shadow-sm">
            {items.map((i) => {
              const active = i.exact ? location.pathname === i.to : location.pathname.startsWith(i.to);
              return (
                <Link
                  key={i.to}
                  to={i.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${active ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                >
                  <i.icon className="h-4 w-4" />
                  {i.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </aside>
          <section className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
            {isRoot ? <Overview /> : <Outlet />}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Overview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link to="/conta/pedidos" className="rounded-xl border border-border p-4 hover:border-primary">
        <Package className="h-6 w-6 text-primary" />
        <p className="mt-2 font-bold">Meus pedidos</p>
        <p className="text-xs text-muted-foreground">Acompanhe entregas e histórico</p>
      </Link>
      <Link to="/conta/enderecos" className="rounded-xl border border-border p-4 hover:border-primary">
        <MapPin className="h-6 w-6 text-primary" />
        <p className="mt-2 font-bold">Endereços</p>
        <p className="text-xs text-muted-foreground">Gerencie onde receber</p>
      </Link>
      <Link to="/conta/favoritos" className="rounded-xl border border-border p-4 hover:border-primary">
        <Heart className="h-6 w-6 text-primary" />
        <p className="mt-2 font-bold">Favoritos</p>
        <p className="text-xs text-muted-foreground">Produtos que você salvou</p>
      </Link>
    </div>
  );
}
