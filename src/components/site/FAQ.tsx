import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "As ofertas são reais?",
    a: "Sim! Selecionamos manualmente todas as ofertas e conferimos os preços diariamente para garantir os melhores descontos.",
  },
  {
    q: "Como funciona o cupom de 10%?",
    a: "O cupom é aplicado automaticamente na sua primeira compra na loja oficial CasaPrati. Basta finalizar o pedido para garantir o desconto.",
  },
  {
    q: "É seguro comprar aqui?",
    a: "Sim. Somos a loja oficial CasaPrati — todos os produtos são vendidos e enviados diretamente por nós, com pagamento 100% seguro.",
  },
  {
    q: "Vocês entregam em todo o Brasil?",
    a: "Sim, enviamos para todo o Brasil pelos Correios e transportadoras. Frete grátis nas compras acima de R$ 100.",
  },
  {
    q: "Como acompanho novas ofertas?",
    a: "Basta voltar aqui diariamente - atualizamos os produtos e descontos todos os dias.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-4 pt-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 text-center">
          <h2 className="text-base font-black uppercase sm:text-2xl">Perguntas Frequentes</h2>
          <p className="text-sm text-muted-foreground">Tire suas dúvidas antes de comprar</p>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-bold"
                >
                  {f.q}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground animate-fade-in-up">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
