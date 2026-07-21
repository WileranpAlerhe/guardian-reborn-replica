import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, close, updateQuantity, removeItem, subtotal, savings, count } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={close} />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-background shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-4 text-primary-foreground">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <span className="font-bold">Meu Carrinho</span>
            <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-bold">
              {count} {count === 1 ? "item" : "itens"}
            </span>
          </div>
          <button
            onClick={close}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-primary-foreground/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-muted">
              <ShoppingBag className="h-9 w-9 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">Seu carrinho está vazio</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione produtos para começar a economizar.
              </p>
            </div>
            <button
              onClick={close}
              className="rounded-full bg-cta px-6 py-3 text-sm font-black uppercase tracking-wide text-cta-foreground shadow-cta hover:bg-cta/90"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* Trust strip */}
              <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-2 text-success">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span className="font-bold">Compra 100% segura</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-2 text-primary">
                  <Truck className="h-4 w-4 shrink-0" />
                  <span className="font-bold">Frete grátis acima de R$ 100</span>
                </div>
              </div>

              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={`${item.id}::${item.variant ?? ""}`}
                    className="flex gap-3 rounded-2xl border border-border bg-card p-3"
                  >
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain p-1.5"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-2 text-[13px] font-semibold text-ink">{item.name}</p>
                      {item.variant && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">Variante: {item.variant}</p>
                      )}
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-base font-black text-cta">{brl(item.price)}</span>
                        {item.oldPrice > item.price && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            {brl(item.oldPrice)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                            className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"
                            aria-label="Diminuir"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                            className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"
                            aria-label="Aumentar"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.variant)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remover
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer / totals */}
            <div className="border-t border-border bg-card p-4">
              {savings > 0 && (
                <div className="mb-2 flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm">
                  <span className="font-semibold text-success">Você está economizando</span>
                  <span className="font-black text-success">{brl(savings)}</span>
                </div>
              )}
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Subtotal</span>
                <span className="text-2xl font-black text-ink">{brl(subtotal)}</span>
              </div>
              <p className="mb-3 text-[11px] text-muted-foreground">
                ou até <strong className="text-ink">10x de {brl(subtotal / 10)}</strong> sem juros
              </p>
              <Link
                to="/checkout"
                onClick={close}
                className="flex items-center justify-center rounded-full bg-cta px-4 py-3.5 text-sm font-black uppercase tracking-wide text-cta-foreground shadow-cta transition hover:bg-cta/90"
              >
                Finalizar compra →
              </Link>
              <button
                onClick={close}
                className="mt-2 flex w-full items-center justify-center rounded-full border border-border py-2.5 text-xs font-bold text-muted-foreground hover:text-ink"
              >
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
