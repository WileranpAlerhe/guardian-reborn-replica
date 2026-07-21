import britaniaFrente from "@/assets/britania-baq2200b-frente.png.asset.json";
import britaniaAngulo from "@/assets/britania-baq2200b-angulo.png.asset.json";
import britaniaLateral from "@/assets/britania-baq2200b-lateral.png.asset.json";
import britaniaAmbiente from "@/assets/britania-baq2200b-ambiente.png.asset.json";
import britaniaPrincipal from "@/assets/britania-baq2200b-principal.png.asset.json";
import earbudsAsset from "@/assets/product-earbuds.jpg";
import smartwatchAsset from "@/assets/product-smartwatch.jpg";
import speakerAsset from "@/assets/product-speaker.jpg";
import sneakersAsset from "@/assets/product-sneakers.jpg";
import perfumeAsset from "@/assets/product-perfume.jpg";
import kitBolsasAmendoa from "@/assets/kit-bolsas-cinf-amendoa.png";
import kitBolsasBordo from "@/assets/kit-bolsas-cinf-bordo.png";
import kitBolsasCaramelo from "@/assets/kit-bolsas-cinf-caramelo.png";
import kitBolsasPreto from "@/assets/kit-bolsas-cinf-preto.png";
import kitBolsasRosa from "@/assets/kit-bolsas-cinf-rosa.png";
import kitBolsasVerde from "@/assets/kit-bolsas-cinf-verde.png";
import pet1151 from "@/assets/pet/1151.jpg";
import pet3065 from "@/assets/pet/3065.jpg";
import pet1999 from "@/assets/pet/1999.jpg";
import pet1523 from "@/assets/pet/1523.jpg";
import pet2561 from "@/assets/pet/2561.jpg";
import pet282 from "@/assets/pet/282.jpg";
import pet1456 from "@/assets/pet/1456.jpg";
import pet2005 from "@/assets/pet/2005.jpg";
import pet1733 from "@/assets/pet/1733.jpg";
import ele0002 from "@/assets/eletronicos/ele-0002.jpg";
import ele0003 from "@/assets/eletronicos/ele-0003.jpg";
import ele0005 from "@/assets/eletronicos/ele-0005.jpg";
import ele0006 from "@/assets/eletronicos/ele-0006.jpg";
import ele0007 from "@/assets/eletronicos/ele-0007.jpg";
import ele0008 from "@/assets/eletronicos/ele-0008.jpg";
import ele0009 from "@/assets/eletronicos/ele-0009.jpg";
import ele0010 from "@/assets/eletronicos/ele-0010.jpg";
import ele0011 from "@/assets/eletronicos/ele-0011.jpg";
import ele0012 from "@/assets/eletronicos/ele-0012.jpg";
import ele0013 from "@/assets/eletronicos/ele-0013.jpg";
import ele0014 from "@/assets/eletronicos/ele-0014.jpg";
import ele0015 from "@/assets/eletronicos/ele-0015.jpg";
import ele0016 from "@/assets/eletronicos/ele-0016.jpg";
import ele0017 from "@/assets/eletronicos/ele-0017.jpg";
import ele0018 from "@/assets/eletronicos/ele-0018.jpg";
import ele0019 from "@/assets/eletronicos/ele-0019.jpg";
import ele0020 from "@/assets/eletronicos/ele-0020.jpg";
import ele0021 from "@/assets/eletronicos/ele-0021.jpg";
import ele0022 from "@/assets/eletronicos/ele-0022.jpg";
import ele0023 from "@/assets/eletronicos/ele-0023.jpg";
import ele0024 from "@/assets/eletronicos/ele-0024.jpg";
import ele0025 from "@/assets/eletronicos/ele-0025.jpg";


const earbuds = earbudsAsset;
const smartwatch = smartwatchAsset;
const speaker = speakerAsset;
const sneakers = sneakersAsset;
const perfume = perfumeAsset;


export type ProductBadge = "oferta" | "novo" | "mais-vendido" | "destaque";

export interface ProductVariant {
  id: string;
  name: string;
  image: string;
  swatch?: string; // CSS color for the swatch
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  image: string;
  category: string;
  oldPrice: number;
  price: number;
  sold: number;
  rating: number;
  affiliateUrl: string;
  badges: ProductBadge[];
  couponText?: string;
  active: boolean;
  order: number;
  variants?: ProductVariant[];
  images?: string[];
}


export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  position: "hero" | "promo";
  active: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface SiteConfig {
  brandName: string;
  tagline: string;
  primaryColor: string; // reserved for future theming
  adminPassword: string;
  whatsapp?: string;
  supportEmail?: string;
}

export const seedCategories: Category[] = [
  { id: "eletronicos", name: "Eletrônicos", emoji: "📱" },
  { id: "casa", name: "Casa", emoji: "🏠" },
  { id: "moda", name: "Moda", emoji: "👗" },
  { id: "beleza", name: "Beleza", emoji: "💄" },
  { id: "esportes", name: "Esportes", emoji: "⚽" },
  { id: "pet", name: "Pet", emoji: "🐾" },
  { id: "ferramentas", name: "Ferramentas", emoji: "🔧" },
  { id: "automotivo", name: "Automotivo", emoji: "🚗" },
];

export const seedBanners: Banner[] = [];

export const seedConfig: SiteConfig = {
  brandName: "Ofertas Express",
  tagline: "As melhores ofertas atualizadas todos os dias",
  primaryColor: "#ee5a24",
  adminPassword: "princeso123",
  whatsapp: "",
  supportEmail: "contato@ofertasexpress.com",
};

export const seedProducts: Product[] = [
  {
    id: "kit-bolsas-cinf-transversal",
    slug: "kit-bolsas-feminina-cinf",
    name: "Kit Bolsas Feminina Transversal Média + Tira Colo + Carteira",
    description:
      "Kit com 3 peças: bolsa transversal média com alça de mão e alça transversal regulável e removível, bolsa tira-colo com corrente e carteira. Material sintético premium com detalhes dourados e logo CINF.",
    image: kitBolsasCaramelo,
    category: "moda",
    oldPrice: 99.9,
    price: 44.91,
    sold: 1000,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["mais-vendido", "oferta", "destaque"],
    couponText: "PRATI10 · 10% OFF já aplicado (válido apenas na 1ª compra)",
    active: true,
    order: -1,
    variants: [
      {
        id: "amendoa-bege",
        name: "Amêndoa-Bege",
        image: kitBolsasAmendoa,
        swatch: "#c9a98a",
      },
      {
        id: "bordo",
        name: "Bordô",
        image: kitBolsasBordo,
        swatch: "#5a1a24",
      },
      {
        id: "caramelo",
        name: "Caramelo Marrom",
        image: kitBolsasCaramelo,
        swatch: "#8b4a25",
      },
      {
        id: "preto",
        name: "Preto",
        image: kitBolsasPreto,
        swatch: "#111111",
      },
      {
        id: "rosa",
        name: "Rosa",
        image: kitBolsasRosa,
        swatch: "#c98a95",
      },
      {
        id: "verde",
        name: "Verde",
        image: kitBolsasVerde,
        swatch: "#1f4a3a",
      },
    ],
  },
  {
    id: "ar-britania-baq2200b",
    name: "Ar-Condicionado Split Britânia BAQ2200B",
    description: "Split parede, silencioso, controle remoto, alta eficiência energética.",
    image: britaniaPrincipal.url,
    images: [
      britaniaPrincipal.url,
      britaniaFrente.url,
      britaniaAngulo.url,
      britaniaLateral.url,
      britaniaAmbiente.url,
    ],
    category: "casa",
    oldPrice: 249.9,
    price: 159.9,
    sold: 2340,
    rating: 4.9,
    affiliateUrl: "https://shopee.com.br",
    badges: ["destaque", "oferta"],
    couponText: "Cupom de 10% já aplicado na 1ª compra",
    active: true,
    order: 0,
  },
  {
    id: "fone-i12",
    name: "Fone Bluetooth i12 Sem Fio",
    image: earbuds,
    category: "eletronicos",
    oldPrice: 89.9,
    price: 49.9,
    sold: 10200,
    rating: 4.8,
    affiliateUrl: "https://shopee.com.br",
    badges: ["mais-vendido", "oferta"],
    couponText: "Cupom de 10% já aplicado na 1ª compra",
    active: true,
    order: 1,
  },
  {
    id: "smartwatch-d20",
    name: "Smartwatch D20 Y68 Relógio Inteligente",
    image: smartwatch,
    category: "eletronicos",
    oldPrice: 149.9,
    price: 89.9,
    sold: 8700,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["mais-vendido", "oferta"],
    couponText: "Cupom de 10% já aplicado na 1ª compra",
    active: true,
    order: 2,
  },
  {
    id: "caixa-som-bluetooth",
    name: "Caixa de Som Bluetooth Portátil",
    image: speaker,
    category: "eletronicos",
    oldPrice: 199.9,
    price: 139.9,
    sold: 6300,
    rating: 4.6,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    couponText: "Cupom de 10% já aplicado na 1ª compra",
    active: true,
    order: 3,
  },
  {
    id: "tenis-casual",
    name: "Tênis Casual Unissex Branco",
    image: sneakers,
    category: "moda",
    oldPrice: 189.9,
    price: 129.9,
    sold: 6400,
    rating: 4.8,
    affiliateUrl: "https://shopee.com.br",
    badges: ["novo"],
    couponText: "Cupom de 10% já aplicado na 1ª compra",
    active: true,
    order: 5,
  },
  {
    id: "perfume-importado",
    name: "Perfume Importado Feminino 100ml",
    image: perfume,
    category: "beleza",
    oldPrice: 219.9,
    price: 149.9,
    sold: 3200,
    rating: 4.9,
    affiliateUrl: "https://shopee.com.br",
    badges: ["novo", "oferta"],
    couponText: "Cupom de 10% já aplicado na 1ª compra",
    active: true,
    order: 6,
  },
  {
    id: "pet-1151",
    slug: "petisco-doguitos-caes-45g",
    name: "Petisco Doguitos para Cães Adultos e Filhotes sabor Linguicinha - 45g",
    description: "Petisco sabor linguiça para cães adultos e filhotes, rico em proteínas e sem corantes artificiais. Textura macia, ideal para recompensa e adestramento.",
    image: pet1151,
    category: "pet",
    oldPrice: 12.9,
    price: 7.69,
    sold: 500,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 100,
  },
  {
    id: "pet-3065",
    slug: "racao-origens-caes-adultos-15kg",
    name: "Ração Origens Cães Adultos Class Carne e Frango 15kg",
    description: "Ração seca para cães adultos, sabor carne e frango. Nutrição completa e balanceada, com vitaminas e minerais essenciais para saúde e pelagem.",
    image: pet3065,
    category: "pet",
    oldPrice: 144.9,
    price: 129.9,
    sold: 637,
    rating: 4.8,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 101,
  },
  {
    id: "pet-1999",
    slug: "racao-umida-friskies-peixe-85g",
    name: "Ração Úmida Friskies Sachê para Gatos Adultos Sabor Peixe ao Molho - 85g",
    description: "Alimento úmido completo e balanceado para gatos adultos. Sabor peixe ao molho, com zinco e ácidos graxos essenciais para pele e pelos saudáveis.",
    image: pet1999,
    category: "pet",
    oldPrice: 3.79,
    price: 2.99,
    sold: 774,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 102,
  },
  {
    id: "pet-1523",
    slug: "racao-golden-special-caes-frango-carne",
    name: "Ração Golden Special para Cães Adultos Sabor Frango e Carne",
    description: "Ração completa para cães adultos, com ingredientes de alta qualidade. Rica em proteínas e nutrientes essenciais para saúde muscular e pelagem brilhante.",
    image: pet1523,
    category: "pet",
    oldPrice: 159.9,
    price: 139.9,
    sold: 911,
    rating: 4.8,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 103,
  },
  {
    id: "pet-2561",
    slug: "petix-tapete-higienico-80x60-30un",
    name: "Petix Tapete Higiênico Super Secão Max 80x60 c/30",
    description: "Tapete higiênico com gel superabsorvente e atrativo canino. Fitas adesivas nas extremidades, ideal para trocas menos frequentes e ambientes sempre limpos.",
    image: pet2561,
    category: "pet",
    oldPrice: 129.99,
    price: 116.9,
    sold: 1048,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 104,
  },
  {
    id: "pet-282",
    slug: "areia-higienica-pipicat-classic",
    name: "Areia Higiênica Pipicat Classic",
    description: "Areia com grãos finos e alta absorção para caixa de areia do gato. Excelente retenção de líquidos e eliminação de odores, mantendo o ambiente agradável.",
    image: pet282,
    category: "pet",
    oldPrice: 14.99,
    price: 13.49,
    sold: 1185,
    rating: 4.8,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 105,
  },
  {
    id: "pet-1456",
    slug: "racao-formula-natural-fresh-meat-mini-pequeno",
    name: "Ração Fórmula Natural Fresh Meat Cães Adultos Porte Mini e Pequeno",
    description: "Alimentação completa e saborosa para cães adultos de porte mini e pequeno. Ingredientes de qualidade que promovem saúde, vitalidade e pelagem brilhante.",
    image: pet1456,
    category: "pet",
    oldPrice: 160.68,
    price: 133.9,
    sold: 1322,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 106,
  },
  {
    id: "pet-2005",
    slug: "racao-royal-canin-hairball-care-85g",
    name: "Ração Royal Canin Sachê Feline Hairball Care - 85g",
    description: "Alimento úmido Super Premium para gatos. Alto nível de proteínas, fibras e nutrientes que reduzem a formação de bolas de pelos e favorecem a digestão.",
    image: pet2005,
    category: "pet",
    oldPrice: 15.9,
    price: 11.09,
    sold: 1459,
    rating: 4.8,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 107,
  },
  {
    id: "pet-1733",
    slug: "pro-plan-dog-adult-reduced-15kg",
    name: "Pro Plan Dog Adult Med/Grande Reduced 15kg",
    description: "Alimento Super Premium completo e balanceado para cães adultos de porte médio, grande e gigante. Tecnologia OPTIFIT, 20% menos calorias e baixa gordura.",
    image: pet1733,
    category: "pet",
    oldPrice: 429.99,
    price: 289.9,
    sold: 1596,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 108,
  },
  {
    id: "ele-0002",
    slug: "cabo-usb-c-turbo-25w-1-metro-lehmox",
    name: "Cabo USB-C Turbo 25W 1 Metro Lehmox",
    description: "Cabo USB-C Turbo 25W 1 Metro Lehmox – O Cabo USB-C Lehmox foi desenvolvido para oferecer carregamento rápido e eficiente com potência de até 25W, garantindo mais agilidade no dia a dia. Compatível com diversos dispositivos que utilizam entrada USB-C, ele",
    image: ele0002,
    category: "eletronicos",
    oldPrice: 4.99,
    price: 3.99,
    sold: 700,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 200,
  },
  {
    id: "ele-0003",
    slug: "maquina-de-cortar-cabelo-sem-fio-barbeador-dragao-4-pentes",
    name: "Máquina De Cortar Cabelo Sem Fio Barbeador Dragão 4 Pentes",
    description: "Máquina de Cortar Cabelo Sem Fio Barbeador Dragão 4 Pentes A Máquina de Acabamento Dragão é a escolha ideal para quem busca praticidade, precisão e versatilidade no cuidado com cabelo e barba. Com design moderno e funcionamento sem fio, ela oferece liberd",
    image: ele0003,
    category: "eletronicos",
    oldPrice: 11.88,
    price: 9.5,
    sold: 701,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 201,
  },
  {
    id: "ele-0005",
    slug: "mini-ventilador-de-mao-turbo-portatil-recarregavel-display",
    name: "Mini Ventilador De Mão Turbo Portatil Recarregavel DIsplay",
    description: "Mini Ventilador de Mão Turbo Portátil Recarregável com Display – Compacto e Silencioso O Mini Ventilador de Mão Portátil foi desenvolvido para proporcionar ventilação eficiente, silenciosa e confortável em qualquer ambiente. Com design compacto e ergonômi",
    image: ele0005,
    category: "eletronicos",
    oldPrice: 27.5,
    price: 22.0,
    sold: 702,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 202,
  },
  {
    id: "ele-0006",
    slug: "suporte-guarda-chuva-celular-p-moto-bike-veicular-universal",
    name: "Suporte Guarda Chuva Celular P/ Moto Bike Veicular Universal",
    description: "Suporte Universal para Celular com Mini Guarda-Chuva para Moto e Bike Garanta mais praticidade, segurança e visibilidade durante seus trajetos com este suporte inovador para celular. Desenvolvido para motos e bicicletas, o produto conta com um exclusivo m",
    image: ele0006,
    category: "eletronicos",
    oldPrice: 22.49,
    price: 17.99,
    sold: 703,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 203,
  },
  {
    id: "ele-0007",
    slug: "ventilador-de-teto-120w-led-3-modos-de-iluminacao-bivolt-127-220v",
    name: "Ventilador De Teto 120w Led 3 Modos De Iluminação Bivolt 127/220v",
    description: "Descrição otimizada O Ventilador de Teto com Iluminação LED 120W é a solução ideal para quem busca conforto térmico e iluminação eficiente em um único produto. Com design moderno e funcionamento silencioso, ele é perfeito para quartos, salas, escritórios",
    image: ele0007,
    category: "eletronicos",
    oldPrice: 53.75,
    price: 43.0,
    sold: 704,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 204,
  },
  {
    id: "ele-0008",
    slug: "cabo-conversor-displayport-hdmi-tomate-preto-15cm-fullhd",
    name: "Cabo Conversor DisplayPort HDMI Tomate Preto 15cm FullHD",
    description: "DESCRIÇÃO O cabo DisplayPort para HDMI permite que você conecte o seu MacBook ou qualquer outro equipamento com saída DisplayPort em uma TV, monitor ou Retroprojetores com entrada HDMI. Assista aos seus vídeos, edite suas imagens ou faça apresentações com",
    image: ele0008,
    category: "eletronicos",
    oldPrice: 10.62,
    price: 8.5,
    sold: 705,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 205,
  },
  {
    id: "ele-0009",
    slug: "carregador-de-celular-veicular-usb-type-c-pd-com-cabo-1-metro-lehmox-le-355-type",
    name: "Carregador De Celular Veicular Usb + Type-C PD com Cabo 1 Metro LEHMOX - LE-355 TYPEC",
    description: "Carregador veicular USB + Type-C PD Lehmox LE-355 com cabo de 1 Metro. Carregue seu celular no carro rápido e eficiente para manter seu celular sempre pronto.",
    image: ele0009,
    category: "eletronicos",
    oldPrice: 17.38,
    price: 13.9,
    sold: 706,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 206,
  },
  {
    id: "ele-0010",
    slug: "carregador-de-celular-turbo-30w-type-c-usb-com-cabo-1-metro-lehmox-le-490-a-c",
    name: "Carregador De Celular Turbo 30W Type-C + Usb Com Cabo 1 Metro Lehmox - LE-490 A+C",
    description: "Carregador De Celular Turbo 30W Type-C + Usb Com Cabo 1 Metro Carregue seus dispositivos rapidamente e com eficiência usando o Carregador de Celular Turbo 30W Type-C. Este carregador avançado é projetado para oferecer carregamento super-rápido para uma va",
    image: ele0010,
    category: "eletronicos",
    oldPrice: 20.25,
    price: 16.2,
    sold: 707,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 207,
  },
  {
    id: "ele-0011",
    slug: "carregador-de-celular-turbo-45w-type-c-pd-com-cabo-1-metro-lehmox-le-356-pd",
    name: "Carregador de Celular Turbo 45W Type-C PD com Cabo 1 Metro LEHMOX - LE-356 PD",
    description: "Carregador de Celular Turbo com 45W, porta Tipo C e cabo de carregamento incluso, para carregar seus dispositivos de forma rápida e confiável. Confira!",
    image: ele0011,
    category: "eletronicos",
    oldPrice: 22.44,
    price: 17.95,
    sold: 708,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 208,
  },
  {
    id: "ele-0012",
    slug: "iluminacao-led-para-fotos-e-videos-profissional-7w-oberon-or-pl03",
    name: "Iluminação LED para Fotos e Vídeos Profissional 7W OBERON - OR-PL03",
    description: "A Iluminação LED Profissional 7W OBERON - OR-PL03 proporciona a luz perfeita para fotos e vídeos de alta qualidade.",
    image: ele0012,
    category: "eletronicos",
    oldPrice: 30.0,
    price: 24.0,
    sold: 709,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 209,
  },
  {
    id: "ele-0013",
    slug: "esfigmomanometro-aneroide-pressao-arterial-vinho",
    name: "Esfigmomanometro Aneroide Pressão Arterial Vinho",
    description: "Esfigmomanômetro Aneróide Premium Nylon com Velcro e Estojo PRECISÃO E CONFIANÇA PARA O MONITORAMENTO DA PRESSÃO ARTERIAL! O Esfigmomanômetro Aneróide Premium foi desenvolvido para oferecer medições precisas da pressão arterial, sendo indicado para uso pr",
    image: ele0013,
    category: "eletronicos",
    oldPrice: 107.91,
    price: 86.33,
    sold: 710,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 210,
  },
  {
    id: "ele-0014",
    slug: "estetoscopio-rappaport-preto-premium",
    name: "Estetoscópio Rappaport Preto Premium",
    description: "Estetoscópio Rappaport Premium Adulto Infantil Profissional Descrição do Produto O Estetoscópio Rappaport Premium foi desenvolvido para oferecer excelente desempenho na ausculta de sons cardíacos, pulmonares e vasculares. Com diafragmas de alta s",
    image: ele0014,
    category: "eletronicos",
    oldPrice: 50.51,
    price: 40.41,
    sold: 711,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 211,
  },
  {
    id: "ele-0015",
    slug: "kit-esfigmomanometro-estetoscopio-rappaport-premium-rosa",
    name: "Kit Esfigmomanômetro + Estetoscópio Rappaport Premium Rosa",
    description: "Kit Esfigmomanômetro + Estetoscópio Rappaport Premium Descrição do Produto O Kit Esfigmomanômetro Aneróide Premium + Estetoscópio Rappaport Premium reúne dois equipamentos essenciais para a aferição da pressão arterial e ausculta de sons cardíacos, pulmon",
    image: ele0015,
    category: "eletronicos",
    oldPrice: 158.41,
    price: 126.73,
    sold: 712,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 212,
  },
  {
    id: "ele-0016",
    slug: "filtro-de-linha-extensao-3-usb-6-tomadas-2-usb-c",
    name: "Filtro de Linha Extensão 3 USB 6 Tomadas 2 USB-C",
    description: "iltro de Linha 6 Tomadas 3 USB 2 USB-C Bivolt Descrição do Produto Organize e alimente vários dispositivos ao mesmo tempo com este Filtro de Linha com 6 tomadas, 3 portas USB e 2 portas USB-C. Ideal para residências, escritórios e setups de informática, e",
    image: ele0016,
    category: "eletronicos",
    oldPrice: 42.5,
    price: 34.0,
    sold: 713,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 213,
  },
  {
    id: "ele-0017",
    slug: "teclado-gamer-mecanico-rgb-switch-azul-abnt2-exbom",
    name: "Teclado Gamer Mecânico Rgb Switch Azul Abnt2 Exbom",
    description: "Teclado Gamer Mecânico Exbom BK-G500 RGB Hot-Swap ABNT2 Switch Azul O Teclado Gamer Mecânico Exbom BK-G500 foi desenvolvido para quem busca desempenho, precisão e durabilidade em jogos e atividades do dia a dia. Equipado com switches mecânicos azuis, ofer",
    image: ele0017,
    category: "eletronicos",
    oldPrice: 112.38,
    price: 89.9,
    sold: 714,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 214,
  },
  {
    id: "ele-0018",
    slug: "controle-gamer-bluetooth-ipega-pg-9666t-rgb-4-em-1",
    name: "Controle Gamer Bluetooth Ipega PG-9666T RGB 4 em 1",
    description: "Controle Gamer Bluetooth Ipega PG-9666T RGB 4 em 1 Sem Fio O Controle Gamer Bluetooth Ipega PG-9666T RGB 4 em 1 foi desenvolvido para entregar máxima versatilidade, conforto e desempenho em diferentes plataformas. Compatível com Switch, PS3, PS4, PC Win",
    image: ele0018,
    category: "eletronicos",
    oldPrice: 174.88,
    price: 139.9,
    sold: 715,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 215,
  },
  {
    id: "ele-0019",
    slug: "leitor-de-codigo-de-barras-1d-sem-fio-laser-ultra-rapido",
    name: "Leitor De Código De Barras 1d Sem Fio Laser Ultra Rápido",
    description: "Leitor de Código de Barras 1D Sem Fio Laser Knup KP-1018A USB O Leitor de Código de Barras Knup KP-1018A é a solução ideal para quem busca mobilidade, velocidade e precisão na leitura de códigos 1D. Com tecnologia a laser e conexão sem fio, proporciona ma",
    image: ele0019,
    category: "eletronicos",
    oldPrice: 124.88,
    price: 99.9,
    sold: 716,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 216,
  },
  {
    id: "ele-0020",
    slug: "leitor-de-codigo-barras-2d-qr-code-usb-tomate-mdk102",
    name: "Leitor de Código Barras 2D QR Code USB Tomate MDK102",
    description: "Leitor de Código de Barras 2D QR Code USB Tomate MDK102 Azul Otimize o atendimento e o controle do seu negócio com o Leitor de Código de Barras Tomate MDK102. Desenvolvido para oferecer leitura rápida e precisa de códigos 1D e 2D (QR Code), é a solução id",
    image: ele0020,
    category: "eletronicos",
    oldPrice: 87.38,
    price: 69.9,
    sold: 717,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 217,
  },
  {
    id: "ele-0021",
    slug: "inalador-e-nebulizador-de-rede-vibratoria-branco-g-tech-nebmesh2",
    name: "Inalador e Nebulizador De Rede Vibratória Branco G-Tech NEBMESH2",
    description: "Inalador e Nebulizador de Rede Vibratória G-Tech NEBMESH2 Branco O G-Tech NEBMESH2 representa o que há de mais avançado em tecnologia de nebulização, utilizando o sistema MESH (rede vibratória) para gerar uma névoa ultrafina, capaz de penetrar mais profu",
    image: ele0021,
    category: "eletronicos",
    oldPrice: 168.75,
    price: 135.0,
    sold: 718,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 218,
  },
  {
    id: "ele-0022",
    slug: "cabo-nylon-type-c-p-type-c-para-iphone-16-pro-16-pro-max-le-478c-c",
    name: "Cabo Nylon Type-C p/ Type-C para Iphone 16 Pro 16 Pro Max LE-478C-C",
    description: "Cabo USB Type-C para Type-C 1 Metro Lehmox – LE-478C-C O Cabo USB Type-C para Type-C Lehmox LE-478C-C oferece praticidade e desempenho para o dia a dia, garantindo carregamento rápido e transferência de dados estável. Com 1 metro de comprimento, é ideal p",
    image: ele0022,
    category: "eletronicos",
    oldPrice: 7.48,
    price: 5.98,
    sold: 719,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 219,
  },
  {
    id: "ele-0023",
    slug: "suporte-tripe-p-celular-em-aluminio-com-cabeca-giratoria-de-180o",
    name: "Suporte Tripe P/ Celular Em Aluminio, Com Cabeca Giratoria de 180º",
    description: "",
    image: ele0023,
    category: "eletronicos",
    oldPrice: 31.12,
    price: 24.9,
    sold: 720,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 220,
  },
  {
    id: "ele-0024",
    slug: "carregador-de-celular-turbo-45w-pd-usb-com-cabo-type-c-1m-lehmox-le-405-a-c",
    name: "Carregador de Celular Turbo 45W PD USB com Cabo Type-C 1M LEHMOX - LE-405 A+C",
    description: "Carregador de Celular Turbo com 45W e cabo Tipo C, porta USB C e USB tradicional, para carregar até dois dispositivos de forma rápida e confiável.",
    image: ele0024,
    category: "eletronicos",
    oldPrice: 24.38,
    price: 19.5,
    sold: 721,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 221,
  },
  {
    id: "ele-0025",
    slug: "teclado-semi-mecanico-com-fio-ergonomico-preto-usb-abnt2",
    name: "Teclado Semi Mecânico Com Fio Ergonômico Preto USB ABNT2",
    description: "Teclado Semi Mecânico USB ABNT2 Ergonômico Lehmox Preto Descrição do Produto O Teclado Semi Mecânico Lehmox foi desenvolvido para oferecer conforto, precisão e excelente desempenho nas atividades do dia a dia. Ideal para trabalho, estudos e jogos, combina",
    image: ele0025,
    category: "eletronicos",
    oldPrice: 31.27,
    price: 25.02,
    sold: 722,
    rating: 4.7,
    affiliateUrl: "https://shopee.com.br",
    badges: ["oferta"],
    active: true,
    order: 222,
  },
];
