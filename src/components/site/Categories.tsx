import { Link } from "@tanstack/react-router";
import { useCategories } from "@/lib/store";
import { track } from "@/lib/tracking";

export function Categories() {
  const categories = useCategories();
  return (
    <section id="categorias" className="px-4 pt-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3">
          <h2 className="text-base font-black uppercase sm:text-lg">Categorias</h2>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              id={`cat-${c.id}`}
              to="/categoria/$slug"
              params={{ slug: c.id }}
              onClick={() =>
                track("category_click", { category_id: c.id, category: c.name, placement: "grid" })
              }
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-card-hover"
            >
              <span className="text-2xl transition group-hover:scale-110">{c.emoji}</span>
              <span className="text-[11px] font-bold leading-tight text-center">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
