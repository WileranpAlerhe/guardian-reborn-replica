import { Gift } from "lucide-react";

export function CouponBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/20 bg-white/98 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full gradient-coupon text-white shadow-cta">
            <Gift className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-black text-ink">Cupom Exclusivo</div>
            <div className="truncate text-[10.5px] font-semibold text-muted-foreground">
              PRATI10 · 10% OFF
            </div>
          </div>
        </div>
        <a
          href="#ofertas"
          className="shrink-0 rounded-full bg-primary px-4 py-2.5 text-[12px] font-black uppercase tracking-wide text-primary-foreground shadow-cta"
        >
          Pegar Desconto
        </a>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
