import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Copy, ArrowUp, ArrowDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { store, useCategories, useProducts, useInvalidateProducts } from "@/lib/store";
import type { Product, ProductBadge } from "@/data/seed";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/curupiro/produtos")({
  component: ProductsAdmin,
});

const BADGES: ProductBadge[] = ["oferta", "novo", "mais-vendido", "destaque"];

function emptyProduct(): Product {
  return {
    id: `p-${Date.now()}`,
    name: "",
    image: "",
    category: "eletronicos",
    oldPrice: 0,
    price: 0,
    sold: 0,
    rating: 5,
    affiliateUrl: "",
    badges: ["oferta"],
    couponText: "Cupom de 10% já aplicado na 1ª compra",
    active: true,
    order: 999,
  };
}

function ProductsAdmin() {
  const products = useProducts();
  const categories = useCategories();
  const invalidate = useInvalidateProducts();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  const list = useMemo(() => {
    const q = query.toLowerCase();
    return [...products]
      .sort((a, b) => a.order - b.order)
      .filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [products, query]);

  const run = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
      await invalidate();
    } catch (e) {
      toast.error(`Falha ao ${label}: ${(e as Error).message}`);
    }
  };

  const move = (idx: number, dir: -1 | 1) => {
    const sorted = [...products].sort((a, b) => a.order - b.order);
    const j = idx + dir;
    if (j < 0 || j >= sorted.length) return;
    [sorted[idx], sorted[j]] = [sorted[j], sorted[idx]];
    void run("reordenar", () => store.reorderProducts(sorted.map((p) => p.id)));
  };

  const duplicate = (p: Product) => {
    void run("duplicar", () =>
      store.upsertProduct({ ...p, id: `${p.id}-copy-${Date.now()}`, name: `${p.name} (cópia)` }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Produtos</h1>
          <p className="text-sm text-muted-foreground">{products.length} produtos cadastrados</p>
        </div>
        <button
          onClick={() => setEditing(emptyProduct())}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-cta"
        >
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar produtos..."
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="hidden border-b border-border bg-muted/50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[3fr_1fr_1fr_1fr_auto] sm:gap-3">
          <span>Produto</span>
          <span>Preço</span>
          <span>Vendidos</span>
          <span>Badges</span>
          <span className="text-right">Ações</span>
        </div>

        {list.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        )}

        {list.map((p, i) => (
          <div
            key={p.id}
            className="grid grid-cols-1 gap-2 border-b border-border p-3 last:border-0 sm:grid-cols-[3fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-3 sm:p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={p.image}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl border border-border bg-white object-contain"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{p.name || "(sem nome)"}</div>
                <div className="text-[11px] text-muted-foreground">
                  {categories.find((c) => c.id === p.category)?.name} • {p.active ? "ativo" : "inativo"}
                </div>
              </div>
            </div>
            <div className="text-sm">
              <div className="font-black text-primary">{brl(p.price)}</div>
              {p.oldPrice > p.price && (
                <div className="text-[11px] text-muted-foreground line-through">{brl(p.oldPrice)}</div>
              )}
            </div>
            <div className="text-sm font-semibold">{p.sold}</div>
            <div className="flex flex-wrap gap-1">
              {p.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary"
                >
                  {b}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              <IconBtn title="Subir" onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></IconBtn>
              <IconBtn title="Descer" onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></IconBtn>
              <IconBtn title="Duplicar" onClick={() => duplicate(p)}><Copy className="h-4 w-4" /></IconBtn>
              <IconBtn title="Editar" onClick={() => setEditing(p)} variant="primary"><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn
                title="Excluir"
                variant="danger"
                onClick={() => {
                  if (confirm(`Excluir "${p.name}"?`)) void run("excluir", () => store.deleteProduct(p.id));
                }}
              >
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProductEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            void run("salvar", async () => {
              await store.upsertProduct(p);
              setEditing(null);
              toast.success("Produto salvo!");
            });
          }}
        />
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  variant?: "default" | "primary" | "danger";
}) {
  const cls =
    variant === "primary"
      ? "bg-primary/10 text-primary hover:bg-primary/20"
      : variant === "danger"
        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
        : "bg-muted text-ink hover:bg-muted/70";
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg ${cls}`}
    >
      {children}
    </button>
  );
}

function ProductEditor({
  initial,
  onSave,
  onClose,
}: {
  initial: Product;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const categories = useCategories();
  const [p, setP] = useState<Product>(initial);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const toggleBadge = (b: ProductBadge) => {
    set(
      "badges",
      p.badges.includes(b) ? p.badges.filter((x) => x !== b) : [...p.badges, b],
    );
  };

  const uploadImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => set("image", reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-background p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">
            {initial.name ? "Editar produto" : "Novo produto"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Nome" full>
            <input
              value={p.name}
              onChange={(e) => set("name", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Categoria">
            <select value={p.category} onChange={(e) => set("category", e.target.value)} className="input">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Slug da URL" full>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">/produto/</span>
              <input
                value={p.slug ?? ""}
                onChange={(e) =>
                  set(
                    "slug",
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9\-_]/g, ""),
                  )
                }
                placeholder="ar-britania-baq2200b"
                className="input flex-1"
              />
            </div>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              Deixe em branco para usar o ID. Você pode mudar o prefixo "/produto" em Integrações.
            </span>
          </Field>

          <Field label="Link de afiliado">
            <input value={p.affiliateUrl} onChange={(e) => set("affiliateUrl", e.target.value)} className="input" placeholder="https://..." />
          </Field>

          <Field label="Preço antigo (R$)">
            <input
              type="number"
              step="0.01"
              value={p.oldPrice}
              onChange={(e) => set("oldPrice", parseFloat(e.target.value) || 0)}
              className="input"
            />
          </Field>

          <Field label="Preço atual (R$)">
            <input
              type="number"
              step="0.01"
              value={p.price}
              onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
              className="input"
            />
          </Field>

          <Field label="Quantidade vendida">
            <input
              type="number"
              value={p.sold}
              onChange={(e) => set("sold", parseInt(e.target.value) || 0)}
              className="input"
            />
          </Field>

          <Field label="Avaliação (0-5)">
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={p.rating}
              onChange={(e) => set("rating", parseFloat(e.target.value) || 0)}
              className="input"
            />
          </Field>

          <Field label="Texto do cupom" full>
            <input value={p.couponText || ""} onChange={(e) => set("couponText", e.target.value)} className="input" />
          </Field>

          <Field label="Imagem" full>
            <div className="flex items-center gap-3">
              {p.image && (
                <img src={p.image} alt="" className="h-16 w-16 rounded-xl border border-border object-contain" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f);
                }}
                className="text-xs"
              />
              <input
                value={p.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="ou cole uma URL"
                className="input flex-1"
              />
            </div>
          </Field>

          <Field label="Badges" full>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBadge(b)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
                    p.badges.includes(b)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Status" full>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={p.active}
                onChange={(e) => set("active", e.target.checked)}
              />
              Produto ativo (visível no site)
            </label>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold">
            Cancelar
          </button>
          <button
            onClick={() => onSave(p)}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black uppercase text-primary-foreground shadow-cta"
          >
            Salvar
          </button>
        </div>

        <style>{`
          .input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--color-border); background: white; padding: 0.6rem 0.75rem; font-size: 0.875rem; outline: none; }
          .input:focus { border-color: var(--color-primary); }
        `}</style>
      </div>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
