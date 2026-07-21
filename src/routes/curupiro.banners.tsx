import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { store, useCategories } from "@/lib/store";

export const Route = createFileRoute("/curupiro/banners")({
  component: BannersAdmin,
});

function BannersAdmin() {
  const categories = useCategories();
  const [newCat, setNewCat] = useState({ name: "", emoji: "🛍" });

  const addCategory = () => {
    if (!newCat.name.trim()) return;
    const id = newCat.name.toLowerCase().replace(/\s+/g, "-");
    store.saveCategories([...categories, { id, name: newCat.name, emoji: newCat.emoji }]);
    setNewCat({ name: "", emoji: "🛍" });
  };

  const removeCategory = (id: string) => {
    if (confirm("Excluir categoria?"))
      store.saveCategories(categories.filter((c) => c.id !== id));
  };

  const updateCategory = (id: string, patch: Partial<{ name: string; emoji: string }>) => {
    store.saveCategories(
      categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Banners e Categorias</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie categorias exibidas na página inicial. O banner principal e o promocional
          usam as imagens carregadas na pasta de assets do projeto.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-base font-black">Categorias</h2>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[160px]">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Nome
            </span>
            <input
              value={newCat.name}
              onChange={(e) => setNewCat((s) => ({ ...s, name: e.target.value }))}
              placeholder="Ex: Cozinha"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="w-24">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Emoji
            </span>
            <input
              value={newCat.emoji}
              onChange={(e) => setNewCat((s) => ({ ...s, emoji: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-center text-lg"
            />
          </label>
          <button
            onClick={addCategory}
            className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-cta"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
              <input
                value={c.emoji}
                onChange={(e) => updateCategory(c.id, { emoji: e.target.value })}
                className="w-12 rounded-lg border border-border px-2 py-1.5 text-center text-lg"
              />
              <input
                value={c.name}
                onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                className="flex-1 rounded-lg border border-border px-2 py-1.5 text-sm font-semibold"
              />
              <button
                onClick={() => removeCategory(c.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-base font-black">Banners</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O banner Hero e o banner promocional já estão configurados com as imagens que você enviou.
          Para trocar, substitua os arquivos em <code>src/assets/hero-banner.jpg</code> e{" "}
          <code>src/assets/promo-banner.jpg</code>.
        </p>
      </div>
    </div>
  );
}
