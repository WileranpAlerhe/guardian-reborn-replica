import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Package, Image as ImageIcon, Settings, LogOut, ExternalLink, Lock, Cable, Code2, Activity, Radio, ShoppingBag, Ticket, Layers } from "lucide-react";
import { useState } from "react";
import { loginAdmin, logoutAdmin, useAdminLoggedIn, useConfig } from "@/lib/store";

export const Route = createFileRoute("/curupiro")({
  head: () => ({
    meta: [
      { title: "Painel Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const logged = useAdminLoggedIn();
  if (!logged) return <LoginScreen />;
  return <AdminShell />;
}

function LoginScreen() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const config = useConfig();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await loginAdmin(pw);
          setErr(!ok);
        }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-black">Painel {config.brandName}</h1>
          <p className="text-xs text-muted-foreground">Acesso restrito ao administrador</p>
        </div>

        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Senha
        </label>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          placeholder="••••••••"
        />
        {err && <p className="mt-2 text-xs font-bold text-destructive">Senha incorreta.</p>}
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-black uppercase tracking-wide text-primary-foreground shadow-cta transition hover:bg-primary/90"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

function AdminShell() {
  const location = useLocation();
  const config = useConfig();
  const path = location.pathname;

  const nav = [
    { to: "/curupiro", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/curupiro/produtos", label: "Produtos", icon: Package },
    { to: "/curupiro/pedidos", label: "Pedidos", icon: ShoppingBag },
    { to: "/curupiro/cupons", label: "Cupons", icon: Ticket },
    { to: "/curupiro/colecoes", label: "Coleções", icon: Layers },
    { to: "/curupiro/analytics", label: "Analytics de Leads", icon: Activity },
    { to: "/curupiro/banners", label: "Banners e Categorias", icon: ImageIcon },

    { to: "/curupiro/integracoes", label: "Integrações", icon: Cable },
    { to: "/curupiro/diagnostico", label: "Diagnóstico", icon: Radio },
    { to: "/curupiro/scripts", label: "Scripts Personalizados", icon: Code2 },
    { to: "/curupiro/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-black leading-none">{config.brandName}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Painel Administrativo
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Ver site
            </Link>
            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>

        <nav className="border-t border-border">
          <div className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 py-1.5">
            {nav.map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <n.icon className="h-3.5 w-3.5" />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
