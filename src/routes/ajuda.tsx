import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { useConfig } from "@/lib/store";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Central de Ajuda — PratiHome" },
      {
        name: "description",
        content:
          "Central de Ajuda PratiHome: pagamento, entrega, trocas, rastreamento e contato.",
      },
      { property: "og:title", content: "Central de Ajuda — PratiHome" },
      {
        property: "og:description",
        content: "Tire suas dúvidas sobre pedidos, entregas, pagamento e trocas.",
      },
    ],
  }),
  component: AjudaPage,
});

const faqs = [
  {
    q: "Como acompanhar meu pedido?",
    a: "Acesse Minha Conta → Pedidos para ver o status em tempo real. Você também recebe atualizações por e-mail.",
  },
  {
    q: "Quais formas de pagamento aceitas?",
    a: "PIX (com 5% de desconto) e cartão de crédito em até 10x sem juros, dependendo do valor.",
  },
  {
    q: "Qual o prazo de entrega?",
    a: "PAC de 5 a 12 dias úteis, SEDEX de 2 a 5 e Loggi/Jadlog conforme cobertura. Frete grátis acima de R$ 100.",
  },
  {
    q: "Como funcionam trocas e devoluções?",
    a: "Você tem 7 dias corridos após o recebimento para solicitar devolução, conforme o Código de Defesa do Consumidor.",
  },
];

function AjudaPage() {
  const config = useConfig();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black text-ink">Central de Ajuda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Perguntas frequentes sobre seus pedidos na PratiHome.
        </p>

        <div className="mt-8 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-white p-4 open:shadow-card"
            >
              <summary className="cursor-pointer list-none text-sm font-bold text-ink">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-white p-5">
          <p className="text-sm font-black text-ink">Ainda precisa de ajuda?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Fale com a gente:{" "}
            {config.supportEmail && (
              <a
                href={`mailto:${config.supportEmail}`}
                className="font-bold text-primary hover:underline"
              >
                {config.supportEmail}
              </a>
            )}
          </p>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}