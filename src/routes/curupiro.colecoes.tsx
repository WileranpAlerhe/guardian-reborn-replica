import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  deleteCollectionFn,
  listCollectionsFn,
  upsertCollectionFn,
} from "@/lib/admin.functions";
import { useProducts } from "@/lib/store";

export const Route = createFileRoute("/curupiro/colecoes")({
  component: CollectionsAdmin,
});

type Collection = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  banner_url: string | null;
  active: boolean;
  order: number;
};

type CP = { collection_id: string; product_id: string; position: number };

function getPw(): string {
  return typeof window !== "undefined" ? localStorage.getItem("oe.pw.v1") ?? "" : "";
}

const empty: Collection = {
  id: "",
  slug: "",
  title: "",
  subtitle: "",
  banner_url: "",
  active: true,
  order: 0,
};

function CollectionsAdmin() {
  const products = useProducts();
  const [rows, setRows] = useState<Collection[]>([]);
  const [links, setLinks] = useState<CP[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ collection: Collection; productIds: string[] } | null>(null);

  async function refresh() {
    setLoading(true);
    const res = await listCollectionsFn({ data: { password: getPw() } });
    if (res.ok) {
      setRows(res.collections as Collection[]);
      setLinks(res.products as CP[]);
    }
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  function open(c: Collection) {
    const ids = links
      .filter((l) => l.collection_id === c.id)
      .sort((a, b) => a.position - b.position)
      .map((l) => l.product_id);
    setEditing({ collection: c, productIds: ids });
  }

  async function save(collection: Collection, productIds: string[]) {
    const payload = {
      ...(collection.id ? { id: collection.id } : {}),
      slug: collection.slug,
      title: collection.title,
      subtitle: collection.subtitle,
      banner_url: collection.banner_url,
      active: collection.active,
      order: Number(collection.order),
    };
    const res = await upsertCollectionFn({
      data: { password: getPw(), collection: payload, productIds },
    });
    if (!res.ok) return alert(res.message);
    setEditing(null);
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Excluir coleção?")) return;
    const res = await deleteCollectionFn({ data: { password: getPw(), id } });
    if (!res.ok) return alert(res.message);
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Coleções</h1>
          <p className="text-sm text-muted-foreground">Agrupe produtos em coleções curadas.</p>
        </div>
        <button
          onClick={() => setEditing({ collection: { ...empty }, productIds: [] })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-black uppercase text-primary-foreground shadow-cta"
        >
          <Plus className="h-4 w-4" /> Nova coleção
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma coleção.</p>
        ) : rows.map((c) => {
          const count = links.filter((l) => l.collection_id === c.id).length;
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black">{c.title}</p>
                  <p className="text-xs text-muted-foreground">/colecao/{c.slug}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {c.active ? "ativa" : "inativa"}
                </span>
              </div>
              {c.subtitle && <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>}
              <p className="mt-2 text-xs">{count} produtos</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => open(c)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted">Editar</button>
                <button onClick={() => remove(c.id)} className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive"><Trash2 className="inline h-3 w-3" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <CollectionModal
          collection={editing.collection}
          initialProducts={editing.productIds}
          allProducts={products.map((p) => ({ id: p.id, name: p.name }))}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function CollectionModal({
  collection,
  initialProducts,
  allProducts,
  onClose,
  onSave,
}: {
  collection: Collection;
  initialProducts: string[];
  allProducts: { id: string; name: string }[];
  onClose: () => void;
  onSave: (c: Collection, ids: string[]) => void;
}) {
  const [c, setC] = useState(collection);
  const [selected, setSelected] = useState<string[]>(initialProducts);
  const [q, setQ] = useState("");

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black">{collection.id ? "Editar coleção" : "Nova coleção"}</h3>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Título"><input value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} className="input" /></Field>
          <Field label="Slug (URL)"><input value={c.slug} onChange={(e) => setC({ ...c, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className="input" /></Field>
          <Field label="Subtítulo"><input value={c.subtitle ?? ""} onChange={(e) => setC({ ...c, subtitle: e.target.value })} className="input" /></Field>
          <Field label="Banner (URL)"><input value={c.banner_url ?? ""} onChange={(e) => setC({ ...c, banner_url: e.target.value })} className="input" /></Field>
          <Field label="Ordem"><input type="number" value={c.order} onChange={(e) => setC({ ...c, order: Number(e.target.value) })} className="input" /></Field>
          <label className="flex items-end gap-2 text-sm font-semibold">
            <input type="checkbox" checked={c.active} onChange={(e) => setC({ ...c, active: e.target.checked })} className="h-4 w-4 accent-primary" />
            Ativa
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
            Produtos ({selected.length})
          </p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produto..."
            className="input mb-2"
          />
          <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
            {filtered.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0 hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="truncate">{p.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-bold">Cancelar</button>
          <button onClick={() => onSave(c, selected)} className="rounded-xl bg-primary px-4 py-2 text-sm font-black uppercase text-primary-foreground shadow-cta">Salvar</button>
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