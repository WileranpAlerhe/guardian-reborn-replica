import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import casaDesktop from "@/assets/casaprati-casa-desktop.png";
import casaMobile from "@/assets/casaprati-casa-mobile.png";
import offDesktop from "@/assets/casaprati-40off-desktop.png";
import offMobile from "@/assets/casaprati-40off-mobile.png";
import { track } from "@/lib/tracking";

interface Slide {
  id: string;
  desktop: string;
  mobile: string;
  alt: string;
  href: string;
}

const slides: Slide[] = [
  {
    id: "hero_casa",
    desktop: casaDesktop,
    mobile: casaMobile,
    alt: "Sua casa mais bonita — Frete grátis acima de R$ 100 e em até 10x sem juros.",
    href: "#ofertas",
  },
  {
    id: "hero_40off",
    desktop: offDesktop,
    mobile: offMobile,
    alt: "Eletroportáteis para sua cozinha com até 40% OFF.",
    href: "#ofertas",
  },
];


export function Hero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    track("view_promotion", {
      promotion_id: slides[0].id,
      promotion_name: slides[0].alt,
      creative_slot: "hero",
    });
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const s = slides[i];

  return (
    <section className="relative">
      <div className="relative overflow-hidden bg-muted">
        {/* MOBILE: banner vertical 4:5 */}
        <a
          href={s.href}
          onClick={() =>
            track("banner_click", { banner_id: s.id, placement: "hero" })
          }
          className="relative block aspect-[4/5] md:hidden"
        >
          <img
            src={s.mobile}
            alt={s.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </a>

        {/* DESKTOP: banner 8:3 */}
        <a
          href={s.href}
          onClick={() =>
            track("banner_click", { banner_id: s.id, placement: "hero" })
          }
          className="relative hidden aspect-[8/3] md:block"
        >
          <img
            src={s.desktop}
            alt={s.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </a>

        {/* Arrows */}
        <button
          onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
          aria-label="Anterior"
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white md:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setI((v) => (v + 1) % slides.length)}
          aria-label="Próximo"
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white md:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-8 bg-primary" : "w-1.5 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
