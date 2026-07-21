import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/conta/pedidos")({
  component: Pedidos,
});

function Pedidos() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, status, total_cents, order_items(id, product_name, quantity, unit_price_cents)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando pedidos...</p>;
  if (!data?.length)
    return (
      <div className="py-12 text-center">
        <p className="font-bold">Você ainda não tem pedidos.</p>
        <p className="mt-1 text-sm text-muted-foreground">Explore nossas ofertas e faça sua primeira compra.</p>
      </div>
    );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black">Meus pedidos</h2>
      {data.map((o: any) => (
        <div key={o.id} className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pedido #{o.id.slice(0, 8)}</p>
              <p className="text-sm font-bold">{new Date(o.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase text-primary">
                {o.status}
              </span>
              <p className="mt-1 text-sm font-black">{brl((o.total_cents ?? 0) / 100)}</p>
            </div>
          </div>
          {o.order_items?.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
              {o.order_items.map((it: any) => (
                <li key={it.id}>{it.quantity}× {it.product_name}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
