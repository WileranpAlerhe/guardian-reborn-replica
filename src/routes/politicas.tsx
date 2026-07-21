import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";

export const Route = createFileRoute("/politicas")({
  head: () => ({
    meta: [
      { title: "Políticas — Privacidade, Troca e Entrega — PratiHome" },
      {
        name: "description",
        content: "Políticas de privacidade, troca, devolução e entrega da PratiHome.",
      },
      { property: "og:title", content: "Políticas — PratiHome" },
      { property: "og:description", content: "Políticas oficiais da loja PratiHome." },
    ],
  }),
  component: PoliticasPage,
});

function PoliticasPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-sm leading-7 text-muted-foreground">
        <section>
          <h1 className="text-3xl font-black text-ink">Políticas da loja</h1>
          <p className="mt-2">Última atualização: {new Date().toLocaleDateString("pt-BR")}.</p>
        </section>

        <section>
          <h2 className="text-xl font-black text-ink">Privacidade</h2>
          <p className="mt-2">
            Coletamos apenas os dados necessários para processar sua compra e melhorar sua
            experiência: nome, e-mail, CPF, telefone e endereço. Não compartilhamos seus
            dados com terceiros fora do processamento do pedido e pagamento.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-ink">Trocas e devoluções</h2>
          <p className="mt-2">
            Você tem 7 dias corridos após o recebimento para solicitar a devolução do
            produto sem custo (arrependimento), conforme o Código de Defesa do
            Consumidor. Produtos com defeito são trocados dentro do prazo de garantia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-ink">Entrega</h2>
          <p className="mt-2">
            Enviamos para todo o Brasil por PAC, SEDEX, Jadlog e Loggi. Frete grátis
            (PAC) em pedidos acima de R$ 100. O prazo começa a contar após a
            confirmação do pagamento.
          </p>
        </section>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}