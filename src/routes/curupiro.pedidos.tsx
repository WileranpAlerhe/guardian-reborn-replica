import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listOrdersFn, updateOrderStatusFn } from "@/lib/admin.functions";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/curupiro/pedidos")({
  component: OrdersAdmin,
});

type OrderRow = {
  id: string;
  external_ref: string | null;
  status: string;
  amount_cents: number;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
};

const STATUSES = ["pending", "paid", "shipped", "delivered", "canceled"];

function getPw(): string {
  return typeof window !== "undefined" ? localStorage.getItem("oe.pw.v1") ?? "" : "";
}

function OrdersAdmin() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  async function refresh() {
    setLoading(true);
    const res = await listOrdersFn({ data: { password: getPw() } });
    if (res.ok) setOrders(res.orders as OrderRow[]);
    else setError(res.message);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function changeStatus(id: string, status: string) {
    const res = await updateOrderStatusFn({ data: { password: getPw(), id, status } });
    if (res.ok) {
      setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    } else {
      alert(res.message);
    }
  }

  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Pedidos</h1>
          <p className="text-sm text-muted-foreground">{orders.length} pedidos no total</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">Todos</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Ref</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Carregando...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhum pedido.</td></tr>
            ) : (
              list.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">{o.external_ref ?? o.id.slice(0, 8)}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold">{o.customer_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.customer_email ?? ""}</div>
                  </td>
                  <td className="px-3 py-2 font-bold">{brl(o.amount_cents / 100)}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-bold"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}