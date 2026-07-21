import { createFileRoute } from "@tanstack/react-router";
import { Package, Flame, ShoppingBag, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useProducts } from "@/lib/store";
import { listOrdersFn } from "@/lib/admin.functions";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/curupiro/")({
  component: Dashboard,
});

function Dashboard() {
  const products = useProducts();
  const [orders, setOrders] = useState<{ status: string; amount_cents: number; created_at: string }[]>([]);

  useEffect(() => {
    const pw = typeof window !== "undefined" ? localStorage.getItem("oe.pw.v1") ?? "" : "";
    if (!pw) return;
    listOrdersFn({ data: { password: pw } }).then((res) => {
      if (res.ok) setOrders(res.orders as typeof orders);
    });
  }, []);

  const paid = orders.filter((o) => o.status !== "canceled");
  const revenue = paid.reduce((s, o) => s + o.amount_cents / 100, 0);
  const pending = orders.filter((o) => o.status === "pending").length;

  const stats = [
    { icon: Package, label: "Total de produtos", value: products.length, color: "bg-primary/10 text-primary" },
    { icon: ShoppingBag, label: "Pedidos", value: orders.length, color: "bg-warning/20 text-primary" },
    { icon: DollarSign, label: "Receita (bruta)", value: brl(revenue), color: "bg-success/10 text-success" },
    { icon: Flame, label: "Em oferta", value: products.filter((p) => p.badges.includes("oferta")).length, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do seu portal de ofertas.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <div className="mt-3 text-2xl font-black">{s.value}</div>
            <div className="text-xs font-semibold text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-base font-black">Boas-vindas 👋</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use os menus acima para gerenciar produtos, banners, categorias e configurações do site.
          As alterações em produtos ficam salvas no banco de dados e aparecem para todos os visitantes.
        </p>
        {pending > 0 && (
          <p className="mt-3 rounded-xl bg-warning/20 p-3 text-xs">
            <strong>Atenção:</strong> {pending} pedido(s) pendente(s) aguardando ação.
          </p>
        )}
      </div>
    </div>
  );
}
