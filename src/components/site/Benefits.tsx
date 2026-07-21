import { Truck, CreditCard, ShieldCheck, RefreshCw, Ticket, Percent } from "lucide-react";

const chips = [
  { icon: Truck, label: "Frete grátis", sub: "acima de R$100" },
  { icon: CreditCard, label: "10x sem juros", sub: "no cartão" },
  { icon: Ticket, label: "Cupom", sub: "PRATI10" },
  { icon: Percent, label: "Até 40% OFF", sub: "ofertas do dia" },
  { icon: ShieldCheck, label: "Compra segura", sub: "site protegido" },
  { icon: RefreshCw, label: "Troca fácil", sub: "em até 7 dias" },
];

export function Benefits() {
  return (
    <section className="border-y border-border bg-white px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 sm:gap-0 sm:divide-x sm:divide-border">
          {chips.map((c) => (
            <div
              key={c.label}
              className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 sm:justify-center sm:rounded-none sm:border-0 sm:bg-transparent sm:px-3 sm:py-1"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <c.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[12px] font-bold text-ink sm:text-[11px] sm:uppercase sm:tracking-wide">
                  {c.label}
                </div>
                <div className="truncate text-[11px] text-muted-foreground sm:text-[10px]">
                  {c.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
