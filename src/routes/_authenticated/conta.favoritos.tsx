import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { seedProducts } from "@/data/seed";
import { brl } from "@/lib/format";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta/favoritos")({
  component: Favoritos,
});

function Favoritos() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data, error } = await supabase.from("wishlist").select("product_id");
      if (error) throw error;
      return data ?? [];
    },
  });

  const remove = useMutation({
    mutationFn: async (product_id: string) => {
      const { error } = await supabase.from("wishlist").delete().eq("product_id", product_id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const items = (data ?? [])
    .map((w) => seedProducts.find((p) => p.id === w.product_id))
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">Favoritos</h2>
      {!items.length && <p className="text-sm text-muted-foreground">Você ainda não tem favoritos.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((p: any) => (
          <div key={p.id} className="flex gap-3 rounded-xl border border-border p-3">
            <img src={p.image} alt={p.name} className="h-20 w-20 rounded-lg object-cover" />
            <div className="flex-1">
              <Link to="/produto/$id" params={{ id: p.id }} className="text-sm font-bold hover:text-primary line-clamp-2">
                {p.name}
              </Link>
              <p className="mt-1 text-sm font-black text-primary">{brl(p.price)}</p>
            </div>
            <button onClick={() => remove.mutate(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
