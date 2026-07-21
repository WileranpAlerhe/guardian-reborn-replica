import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Home, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/logo-shopee-ofertas.png";
import { Footer } from "@/components/site/Footer";
import { useConfig } from "@/lib/store";
import { brl } from "@/lib/format";
import { track } from "@/lib/tracking";
import { getOrderStatusFn } from "@/lib/checkout.functions";

type Search = { ref?: string };

export const Route = createFileRoute("/pagamento-aprovado")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pagamento aprovado ✓ | Obrigado pela compra" },
      { name: "description", content: "Seu pagamento foi confirmado com sucesso." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaidPage,
});

function PaidPage() {
  const { ref } = Route.useSearch();
  const config = useConfig();
  const [order, setOrder] = useState<{ amount: number; product: string } | null>(null);
  const [firedPurchase, setFiredPurchase] = useState(false);

  useEffect(() => {
    if (!ref) return;
    getOrderStatusFn({ data: { externalRef: ref } }).then((res) => {
      if (res.ok) {
        setOrder({ amount: res.amountCents / 100, product: res.productName });
      }
    });
  }, [ref]);

  // Dispara evento purchase apenas quando confirmado (server-side)
  useEffect(() => {
    if (!order || firedPurchase || !ref) return;
    track("purchase", {
      transaction_id: ref,
      value: order.amount,
      currency: "BRL",
      ecommerce: {
        transaction_id: ref,
        value: order.amount,
        currency: "BRL",
        items: [{ item_name: order.product, price: order.amount, quantity: 1 }],
      },
    });
    setFiredPurchase(true);
    // ==== INSIRA AQUI SEU CÓDIGO DE MARCAÇÃO DE PURCHASE (Meta/Ads pixels) ====
    // Ex.: window.fbq && window.fbq("track", "Purchase", { value: order.amount, currency: "BRL" });
  }, [order, firedPurchase, ref]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-success/10 via-background to-background">
      <header className="border-b border-border/70 bg-white/95">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoAsset} alt={config.brandName} className="h-11 w-auto object-contain" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl border border-success/30 bg-card p-6 text-center shadow-card sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-ink sm:text-3xl">
            Pagamento aprovado!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Recebemos seu PIX com sucesso. Um comprovante foi enviado para o seu e-mail.
          </p>

          {order && (
            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-border bg-muted/30 p-4 text-left">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Detalhes do pedido
              </div>
              <div className="mt-2 text-sm font-bold text-ink">{order.product}</div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Valor pago</span>
                <span className="font-black text-success">{brl(order.amount)}</span>
              </div>
              {ref && (
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Código do pedido</span>
                  <span className="font-mono text-[10px] text-ink">{ref}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            Transação processada em ambiente seguro
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black uppercase tracking-wide text-primary-foreground shadow-cta hover:bg-primary/90"
          >
            <Home className="h-4 w-4" /> Voltar às ofertas
          </Link>

          <p className="mt-6 text-[11px] text-muted-foreground">
            Dúvidas? Fale com nosso suporte pelo e-mail{" "}
            <a href={`mailto:${config.supportEmail ?? ""}`} className="font-semibold text-primary">
              {config.supportEmail}
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
