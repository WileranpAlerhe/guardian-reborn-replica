import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { deleteCouponFn, listCouponsFn, upsertCouponFn } from "@/lib/admin.functions";

export const Route = createFileRoute("/curupiro/cupons")({
  component: CouponsAdmin,
});

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

function getPw(): string {
  return typeof window !== "undefined" ? localStorage.getItem("oe.pw.v1") ?? "" : "";
}

const empty: Coupon = {
  id: "",
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: 10,
  min_order: 0,
  max_uses: null,
  used_count: 0,
  active: true,
  expires_at: null,
};

function CouponsAdmin() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);

  async function refresh() {
    setLoading(true);
    const res = await listCouponsFn({ data: { password: getPw() } });
    if (res.ok) setRows(res.coupons as Coupon[]);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function save(c: Coupon) {
    const payload = {
      ...(c.id ? { id: c.id } : {}),
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: Number(c.discount_value),
      min_order: Number(c.min_order),
      max_uses: c.max_uses,
      active: c.active,
      expires_at: c.expires_at,
    };
    const res = await upsertCouponFn({ data: { password: getPw(), coupon: payload } });
    if (!res.ok) return alert(res.message);
    setEditing(null);
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Excluir cupom?")) return;
    const res = await deleteCouponFn({ data: { password: getPw(), id } });
    if (!res.ok) return alert(res.message);
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Cupons</h1>
          <p className="text-sm text-muted-foreground">Crie e gerencie códigos de desconto.</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-black uppercase text-primary-foreground shadow-cta"
        >
          <Plus className="h-4 w-4" /> Novo cupom
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Mín. pedido</th>
              <th className="px-3 py-2">Usos</th>
              <th className="px-3 py-2">Ativo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Carregando...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum cupom.</td></tr>
            ) : rows.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-3 py-2 font-bold">{c.code}</td>
                <td className="px-3 py-2">{c.discount_type}</td>
                <td className="px-3 py-2">{c.discount_type === "percent" ? `${c.discount_value}%` : `R$ ${c.discount_value}`}</td>
                <td className="px-3 py-2">R$ {c.min_order}</td>
                <td className="px-3 py-2">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                <td className="px-3 py-2">{c.active ? "✓" : "—"}</td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => setEditing(c)} className="mr-2 text-xs font-bold text-primary hover:underline">Editar</button>
                  <button onClick={() => remove(c.id)} className="text-destructive"><Trash2 className="inline h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <CouponModal coupon={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CouponModal({ coupon, onSave, onClose }: { coupon: Coupon; onSave: (c: Coupon) => void; onClose: () => void }) {
  const [c, setC] = useState(coupon);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black">{coupon.id ? "Editar cupom" : "Novo cupom"}</h3>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 text-sm">
          <Field label="Código">
            <input value={c.code} onChange={(e) => setC({ ...c, code: e.target.value.toUpperCase() })} className="input" />
          </Field>
          <Field label="Descrição">
            <input value={c.description ?? ""} onChange={(e) => setC({ ...c, description: e.target.value })} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <select value={c.discount_type} onChange={(e) => setC({ ...c, discount_type: e.target.value as "percent" | "fixed" })} className="input">
                <option value="percent">% Percentual</option>
                <option value="fixed">R$ Fixo</option>
              </select>
            </Field>
            <Field label="Valor">
              <input type="number" value={c.discount_value} onChange={(e) => setC({ ...c, discount_value: Number(e.target.value) })} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pedido mínimo (R$)">
              <input type="number" value={c.min_order} onChange={(e) => setC({ ...c, min_order: Number(e.target.value) })} className="input" />
            </Field>
            <Field label="Máx. usos (vazio = ilimitado)">
              <input type="number" value={c.max_uses ?? ""} onChange={(e) => setC({ ...c, max_uses: e.target.value ? Number(e.target.value) : null })} className="input" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={c.active} onChange={(e) => setC({ ...c, active: e.target.checked })} className="h-4 w-4 accent-primary" />
            Ativo
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-bold">Cancelar</button>
          <button onClick={() => onSave(c)} className="rounded-xl bg-primary px-4 py-2 text-sm font-black uppercase text-primary-foreground shadow-cta">Salvar</button>
        </div>
        <style>{`.input{width:100%;border:1px solid var(--color-border);border-radius:.75rem;padding:.5rem .75rem;font-size:.875rem;outline:none;background:white}.input:focus{border-color:var(--color-primary)}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}