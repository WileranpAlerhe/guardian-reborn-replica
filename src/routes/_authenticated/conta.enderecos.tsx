import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conta/enderecos")({
  component: Enderecos,
});

function Enderecos() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ label: "Casa", recipient: "", zip: "", street: "", number: "", complement: "", district: "", city: "", state: "" });

  const { data } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("addresses").insert({ ...form, user_id: u.user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Endereço salvo");
      qc.invalidateQueries({ queryKey: ["addresses"] });
      setForm({ label: "Casa", recipient: "", zip: "", street: "", number: "", complement: "", district: "", city: "", state: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black">Endereços</h2>
      <div className="space-y-2">
        {data?.map((a: any) => (
          <div key={a.id} className="flex items-start justify-between rounded-xl border border-border p-4">
            <div className="text-sm">
              <p className="font-bold">{a.label}</p>
              <p>{a.street}, {a.number}{a.complement ? ` - ${a.complement}` : ""}</p>
              <p className="text-muted-foreground">{a.district} · {a.city}/{a.state} · CEP {a.zip}</p>
            </div>
            <button onClick={() => remove.mutate(a.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {!data?.length && <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); add.mutate(); }}
        className="rounded-xl border border-border p-4 space-y-3"
      >
        <p className="font-bold">Adicionar endereço</p>
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Apelido (Casa, Trabalho...)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input required placeholder="Destinatário" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input required placeholder="CEP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input required placeholder="Rua" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="col-span-2 rounded-lg border border-border px-3 py-2 text-sm" />
          <input required placeholder="Número" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input placeholder="Complemento" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input required placeholder="Bairro" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input required placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input required placeholder="UF" maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} className="col-span-2 rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <button disabled={add.isPending} className="w-full rounded-xl bg-primary py-2.5 text-sm font-black text-primary-foreground hover:bg-primary/90">
          {add.isPending ? "Salvando..." : "Salvar endereço"}
        </button>
      </form>
    </div>
  );
}
