import { useConfig } from "@/lib/store";
import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/casaprati-logo-new.png";
import { CreditCard, Shield, Truck, Headphones, Instagram, Facebook, Youtube } from "lucide-react";

export function Footer() {
  const config = useConfig();
  return (
    <footer className="mt-14">
      {/* Trust strip */}
      <div className="border-y border-border bg-muted/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4 md:py-8">
          {[
            { icon: Truck, title: "Frete Grátis", desc: "Acima de R$ 100" },
            { icon: CreditCard, title: "10x sem juros", desc: "Todos os cartões" },
            { icon: Shield, title: "Compra Segura", desc: "Site 100% protegido" },
            { icon: Headphones, title: "Suporte 24/7", desc: "Estamos aqui pra ajudar" },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <b.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black text-ink">{b.title}</p>
                <p className="text-[11px] text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-ink text-white/85">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="rounded-2xl bg-white p-3 inline-block">
              <img src={logoAsset} alt={config.brandName || "PratiHome"} className="h-12 w-auto object-contain" />
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/70">
              Tudo para deixar sua casa mais bonita, prática e aconchegante. Curadoria de produtos
              com qualidade garantida e entrega para todo o Brasil.
            </p>
            <div className="mt-4 flex gap-2">
              {[Instagram, Facebook, Youtube].map((Icon, k) => (
                <a
                  key={k}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-primary"
                  aria-label="Redes sociais"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-wider text-primary-glow">Institucional</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/sobre" className="hover:text-primary-glow">Sobre a PratiHome</Link></li>
              <li><Link to="/politicas" className="hover:text-primary-glow">Políticas</Link></li>
              <li><Link to="/ajuda" className="hover:text-primary-glow">Central de Ajuda</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-wider text-primary-glow">Ajuda</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/ajuda" className="hover:text-primary-glow">Central de Atendimento</Link></li>
              <li><Link to="/politicas" className="hover:text-primary-glow">Trocas e Devoluções</Link></li>
              <li><Link to="/politicas" className="hover:text-primary-glow">Prazo de Entrega</Link></li>
              <li><Link to="/conta/pedidos" className="hover:text-primary-glow">Meus Pedidos</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-wider text-primary-glow">Contato</div>
            <ul className="mt-3 space-y-2 text-sm">
              {config.supportEmail && (
                <li>
                  <a href={`mailto:${config.supportEmail}`} className="hover:text-primary-glow">
                    {config.supportEmail}
                  </a>
                </li>
              )}
              <li className="text-white/70">Seg a Sex, das 9h às 18h</li>
            </ul>
            <div className="mt-5">
              <p className="text-xs font-black uppercase tracking-wider text-primary-glow">Formas de pagamento</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Visa", "Master", "Elo", "Amex", "Hiper", "Pix", "Boleto"].map((m) => (
                  <span key={m} className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-white/90">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-4 text-center text-[11px] text-white/50">
            © {new Date().getFullYear()} {config.brandName || "PratiHome"}. Todos os direitos reservados.
            CNPJ 00.000.000/0001-00
          </div>
        </div>
      </div>
    </footer>
  );
}
