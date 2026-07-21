// Per-product rich content: descrição, benefícios, specs, FAQ, avaliações.
// Cada produto tem conteúdo escrito à mão de acordo com sua categoria e uso real.
import review9 from "@/assets/britania-review-9.png.asset.json";
import review10 from "@/assets/britania-review-10.png.asset.json";
import review11 from "@/assets/britania-review-11.png.asset.json";
import review12 from "@/assets/britania-review-12.png.asset.json";
import review13 from "@/assets/britania-review-13.png.asset.json";
import review14 from "@/assets/britania-review-14.png.asset.json";
import review15 from "@/assets/britania-review-15.png.asset.json";

const britaniaReviewPhotos = [
  review9.url,
  review10.url,
  review11.url,
  review12.url,
  review13.url,
  review14.url,
  review15.url,
];

export interface Review {
  n: string;
  s: number; // stars 1..5
  t: string;
  withPhoto?: boolean;
  photo?: string;
  /** Days ago (approx). Undefined = auto distribute. */
  daysAgo?: number;
}

export interface ProductDetails {
  description: string;
  benefits: string[];
  specs: [string, string][];
  recommendedFor: string;
  advantages: string[];
  faq: { q: string; a: string }[];
  boxContents: string[];
  reviews: Review[];
}

export const productDetails: Record<string, ProductDetails> = {
  // ---------------- Kit Bolsas CINF ----------------
  "kit-bolsas-cinf-transversal": {
    description:
      "Kit completo de 3 peças assinado CINF: bolsa transversal média com alça de mão e alça longa regulável e removível, mini bolsa tira-colo com corrente dourada e carteira com múltiplos compartimentos. Confeccionado em material sintético de alto padrão, textura riscada elegante e detalhes em dourado. Ideal para o dia a dia, trabalho, faculdade e passeios.",
    benefits: [
      "Kit 3 em 1: bolsa média + tira-colo + carteira",
      "Alça transversal regulável e removível",
      "Detalhes dourados e logo CINF em metal",
      "Compartimentos organizados com zíper",
      "Material resistente e fácil de limpar",
      "Combina com looks casuais e sociais",
    ],
    specs: [
      ["Marca", "CINF"],
      ["Peças inclusas", "3 (bolsa + tira-colo + carteira)"],
      ["Material", "Couro sintético de alta qualidade"],
      ["Tipo de fechamento", "Zíper e ímã"],
      ["Alça", "De mão + transversal regulável e removível"],
      ["Compartimentos", "Interno principal + bolso com zíper"],
      ["Estilo", "Casual social"],
      ["Gênero", "Feminino"],
    ],
    recommendedFor:
      "Uso diário, trabalho, universidade, viagens curtas, presente para namorada, mãe, amiga ou aniversariantes.",
    advantages: [
      "Três peças pelo preço de uma bolsa comum",
      "Cores versáteis que combinam com qualquer look",
      "Acabamento premium com ferragens douradas",
      "Interior forrado e organizado",
      "Cupom de 10% já aplicado no valor final",
    ],
    faq: [
      {
        q: "As três peças vêm juntas?",
        a: "Sim, o kit inclui a bolsa média, a mini bolsa tira-colo e a carteira, todas na mesma cor escolhida.",
      },
      {
        q: "Qual o tamanho da bolsa principal?",
        a: "A bolsa média mede aproximadamente 28cm de largura por 22cm de altura e 12cm de profundidade — comporta celular, carteira, chaves, óculos e itens do dia a dia.",
      },
      {
        q: "O material é resistente?",
        a: "Sim, é feito em couro sintético premium com textura riscada, resistente ao uso diário e fácil de higienizar com pano úmido.",
      },
      {
        q: "A cor da foto é fiel ao produto?",
        a: "Sim, as fotos são reais do produto. Pode haver leve variação de tonalidade pela iluminação da tela do celular.",
      },
    ],
    boxContents: [
      "1x Bolsa média com alça de mão",
      "1x Alça transversal regulável e removível",
      "1x Bolsa tira-colo com corrente",
      "1x Carteira feminina CINF",
      "Embalagem de proteção",
    ],
    reviews: [
      { n: "Amanda R.", s: 5, t: "Amei o kit! A bolsa é linda, o material parece couro de verdade e o dourado dá um charme. Combina com tudo. Recebi em 4 dias.", photo: "/assets/cinf-review-13.png" },
      { n: "Bianca S.", s: 5, t: "Comprei na cor caramelo e fiquei apaixonada. A alça transversal é super confortável e a carteirinha cabe tudo dentro.", photo: "/assets/cinf-review-new-6.png" },
      { n: "Carolina M.", s: 5, t: "Presente pra minha mãe, ela chorou de emoção. Kit lindo e muito bem embalado, com cheirinho de novo.", photo: "/assets/cinf-review-6.png" },
      { n: "Débora L.", s: 4, t: "Bolsa linda, só achei a mini tira-colo um pouco pequena, mas pro visual fica perfeita. Recomendo.", photo: "/assets/cinf-review-new-8.png" },
      { n: "Eliane F.", s: 5, t: "Chegou antes do prazo, embalada com muito cuidado. Estou usando todos os dias no trabalho, virei referência entre as colegas.", photo: "/assets/cinf-review-new-7.png" },
      { n: "Fernanda A.", s: 5, t: "Kit lindíssimo, o couro sintético é firme e o dourado das ferragens não desbota. Estou usando há 2 meses e continua nova.", photo: "/assets/cinf-review-14.png" },
      { n: "Gabriela T.", s: 5, t: "Comprei na cor preta e é sofisticada demais. Uso no trabalho e todo mundo pergunta onde comprei.", photo: "/assets/cinf-review-8.png" },
      { n: "Helena B.", s: 5, t: "A carteirinha é ótima, cabe todos os cartões, cédulas e ainda tem espaço pras moedas. Kit completo.", photo: "/assets/cinf-review-9.png" },
      { n: "Isabela N.", s: 4, t: "Bolsa maravilhosa, só a mini tira-colo é bem pequenininha mesmo. Mas dá pra usar em festinha à noite.", photo: "/assets/cinf-review-new-2.png" },
      { n: "Larissa O.", s: 5, t: "Presente de dia das mães, minha mãe amou. Bem embalado com papel de seda e caixa da marca.", photo: "/assets/cinf-review-new-4.png" },
      { n: "Mariana V.", s: 5, t: "Cor rosa é um encanto, exatamente como na foto. Combina com preto, jeans, off-white, tudo.", photo: "/assets/cinf-review-15.png" },
      { n: "Natália R.", s: 5, t: "Comprei o kit no marrom caramelo, chique demais. Vale muito o preço, três peças por esse valor é presente.", photo: "/assets/cinf-review-new-3.png" },
      { n: "Olivia P.", s: 5, t: "Muito bem costurada, sem fios soltos. As alças são reforçadas e o zíper desliza suave.", photo: "/assets/cinf-review-7.png" },
      { n: "Patrícia G.", s: 5, t: "Chegou em 3 dias em Belo Horizonte. Embalada com plástico bolha, sem amassar. Show." },
      { n: "Renata C.", s: 5, t: "A alça longa transversal é super confortável, não machuca o ombro nem com a bolsa cheia." },
      { n: "Sabrina D.", s: 4, t: "Achei o material bom, parece couro legítimo mesmo. Só senti falta de mais um bolso interno.", photo: "/assets/cinf-review-10.png" },
      { n: "Tatiane L.", s: 5, t: "Comprei pra minha filha adolescente e ela pirou. A carteira dela agora é essa e a bolsa também." },
      { n: "Vanessa M.", s: 5, t: "Kit muito versátil, uso a média no dia a dia e a tira-colo pra sair à noite. Duas bolsas em uma compra.", photo: "/assets/cinf-review-11.png" },
      { n: "Yasmin K.", s: 5, t: "A cor preta é linda, super clean e elegante. Combina com qualquer produção.", photo: "/assets/cinf-review-new-5.png" },
      { n: "Aline F.", s: 5, t: "Comprei pra viajar e caiu direitinho na mochila de mão. Espaço bom sem ser exagerado.", photo: "/assets/cinf-review-12.png" },
      { n: "Beatriz H.", s: 4, t: "Bolsa boa e bonita. Chegou dentro do prazo, embalada com cuidado. Só a corrente da mini que é um pouco fina." },
      { n: "Camila I.", s: 5, t: "Uso todo dia na faculdade, cabe caderno, estojo, celular, carteira e ainda sobra espaço." },
      { n: "Diana J.", s: 5, t: "O acabamento das costuras é impecável. Parece bolsa de marca cara mesmo, ninguém acredita no preço." },
      { n: "Elisa Q.", s: 5, t: "Cheguei em casa, abri a caixa e me apaixonei. As três peças combinam perfeitamente entre si." },
      { n: "Fábia U.", s: 5, t: "Recomendo sem medo. Já é minha segunda compra, agora comprei o kit em outra cor pra variar." },
    ],
  },

  // ---------------- Ar-Condicionado Britânia ----------------
  "ar-britania-baq2200b": {
    description:
      "Ar-Condicionado Split Britânia BAQ2200B com tecnologia de refrigeração rápida e baixo consumo. Painel digital com controle remoto, modo silencioso para dormir e função sleep. Design compacto que se integra a qualquer ambiente. Ideal para quartos, salas e escritórios de até 20m².",
    benefits: [
      "Refrigeração rápida — deixa o ambiente gelado em minutos",
      "Modo silencioso ideal para dormir",
      "Controle remoto com display digital",
      "Baixo consumo de energia (classe A)",
      "Filtro que reduz odores e poeira",
      "Função timer programável",
    ],
    specs: [
      ["Marca", "Britânia"],
      ["Modelo", "BAQ2200B"],
      ["Capacidade", "9.000 BTUs"],
      ["Tipo", "Split parede"],
      ["Voltagem", "220V"],
      ["Classificação energética", "A"],
      ["Ruído", "A partir de 26 dB (modo silencioso)"],
      ["Controle", "Remoto sem fio incluso"],
      ["Ambiente indicado", "Até 20m²"],
    ],
    recommendedFor:
      "Quartos de casal, salas pequenas, home office e escritórios comerciais com boa vedação.",
    advantages: [
      "Consumo econômico comprovado (classe A)",
      "Instalação padrão feita por qualquer técnico",
      "Garantia de fábrica de 12 meses",
      "Marca nacional consolidada com assistência em todo Brasil",
      "Cupom de 10% já aplicado no preço final",
    ],
    faq: [
      {
        q: "Vem com kit de instalação?",
        a: "O produto acompanha o aparelho, o controle remoto e o suporte básico. O kit de tubulação e a instalação são adquiridos separadamente com o técnico.",
      },
      {
        q: "Funciona em 110V?",
        a: "Não, este modelo é 220V. Recomendamos verificar a voltagem da sua residência antes da compra.",
      },
      {
        q: "Quantos m² ele resfria?",
        a: "Ambientes de até 20m² com boa vedação. Para cômodos maiores recomendamos um modelo de maior BTU.",
      },
      {
        q: "Tem garantia?",
        a: "Sim, 12 meses de garantia direta com a Britânia mais 7 dias de arrependimento pelo Código do Consumidor.",
      },
    ],
    boxContents: [
      "1x Ar-Condicionado Split Britânia BAQ2200B",
      "1x Controle remoto",
      "1x Kit de fixação básico",
      "1x Manual de instruções em português",
      "1x Nota fiscal eletrônica",
    ],
    reviews: ([
      {
        n: "Ricardo A.",
        s: 5,
        t: "Instalei no quarto e gela muito rápido. O modo silencioso é ótimo pra dormir, quase não escuto o barulho.",
      },
      {
        n: "Patrícia N.",
        s: 5,
        t: "Consumo baixíssimo, minha conta de luz nem subiu. Vale muito a pena pelo preço.",
      },
      {
        n: "Bruno G.",
        s: 5,
        t: "Britânia sempre entregou qualidade e esse modelo confirmou. Fácil de usar e o controle é bem intuitivo.",
      },
      {
        n: "Marcela D.",
        s: 4,
        t: "Muito bom, só demorou um pouco pra chegar mas veio bem embalado, sem nenhum arranhão.",
      },
      {
        n: "Fábio T.",
        s: 5,
        t: "Comprei um pra sala e outro pro quarto. Ambos funcionando perfeitamente há 3 meses. Recomendo.",
        withPhoto: true,
      },
      { n: "Alessandro P.", s: 5, t: "Ar gela muito rápido, em 5 minutos o quarto já está fresco. Silencioso à noite, dormi sem incômodo.", withPhoto: true },
      { n: "Bruna V.", s: 5, t: "Instalação simples, técnico veio e em 2 horas estava funcionando. Consumo de energia baixo, a conta nem subiu tanto." },
      { n: "Cesar M.", s: 5, t: "Painel digital funciona certinho, controle remoto de boa qualidade. Modo sleep é show." },
      { n: "Daniela R.", s: 4, t: "Bom produto, gela bem e é silencioso. Só o manual poderia ser mais detalhado sobre as funções." },
      { n: "Eduardo S.", s: 5, t: "Comprei pra sala de 18m² e dá conta tranquilamente. Recomendo o modelo, custo-benefício ótimo." },
      { n: "Flávia T.", s: 5, t: "Chegou bem embalado, sem amassados. Fui buscar no CD porque o meu prédio não recebe volumes grandes." },
      { n: "Gustavo O.", s: 5, t: "Já é o segundo que compro, o primeiro está lá em casa há 3 anos funcionando perfeito.", withPhoto: true },
      { n: "Heloísa N.", s: 5, t: "Design compacto ficou lindo no meu quarto, não pesou visualmente. E gela absurdamente rápido." },
      { n: "Igor L.", s: 4, t: "Bom aparelho, cumpre o que promete. Só achei o controle remoto um pouco simples pro nível do produto." },
      { n: "Julia K.", s: 5, t: "Ganhei da minha mãe, instalei no meu quarto e amei. Muito silencioso, quase não escuto." },
      { n: "Kleber J.", s: 5, t: "Nota fiscal chegou junto, garantia certinha. Britânia sempre entrega qualidade nos aparelhos." },
      { n: "Lorena I.", s: 5, t: "Modo silencioso pra dormir é sensacional, esfria sem fazer ruído. Vale cada centavo." },
      { n: "Marcelo H.", s: 5, t: "Instalação inclusa em algumas cidades, na minha veio um técnico da própria empresa. Serviço bom." },
      { n: "Nicole G.", s: 5, t: "Comprei durante uma promoção com o cupom aplicado, saiu por um preço imbatível. Muito satisfeita." },
      { n: "Otávio F.", s: 4, t: "Produto bom, chegou em bom estado. Só a embalagem interna que poderia ter mais proteção." },
      { n: "Paula E.", s: 5, t: "Estou usando há 6 meses e continua gelando igual ao primeiro dia. Zero manutenção até agora." },
      { n: "Ricardo D.", s: 5, t: "Ambiente esfria em 5 min, mesmo com temperatura de 32°C do lado de fora. Impressionante.", withPhoto: true },
      { n: "Sônia C.", s: 5, t: "A função sleep economiza bastante energia. Ligo antes de dormir e a conta de luz não pesa." },
      { n: "Thiago B.", s: 5, t: "Suporte da Britânia funciona bem, tive uma dúvida na instalação e me atenderam por WhatsApp." },
      { n: "Ursula A.", s: 5, t: "Chegou antes do prazo, muito bem embalado com isopor e plástico bolha. Sem riscos ou amassos." },
    ] as Review[]).map((r, i) => ({ ...r, photo: britaniaReviewPhotos[i % britaniaReviewPhotos.length] })),
  },

  // ---------------- Fone i12 ----------------
  "fone-i12": {
    description:
      "Fone de ouvido Bluetooth i12 TWS sem fio com estojo carregador. Conexão automática ao abrir a caixinha, som estéreo balanceado, microfone integrado para chamadas e comandos por toque. Compatível com Android e iOS. Bateria com até 4h de uso contínuo e mais 12h com o case.",
    benefits: [
      "Conexão Bluetooth 5.0 rápida e estável",
      "Estojo carregador portátil incluso",
      "Controle por toque (play, pausar, atender)",
      "Microfone integrado para ligações e assistente de voz",
      "Design leve e ergonômico",
      "Compatível com iOS e Android",
    ],
    specs: [
      ["Modelo", "i12 TWS"],
      ["Conexão", "Bluetooth 5.0"],
      ["Alcance", "Até 10 metros"],
      ["Autonomia dos fones", "Até 4 horas"],
      ["Autonomia com case", "Até 12 horas"],
      ["Tempo de carga", "Cerca de 1h30"],
      ["Entrada de carga", "Micro USB"],
      ["Peso por fone", "4g"],
      ["Cor", "Branco"],
    ],
    recommendedFor:
      "Estudantes, home office, chamadas rápidas, exercícios leves e uso diário no transporte.",
    advantages: [
      "Preço acessível com qualidade sonora surpreendente",
      "Pareamento instantâneo — abriu a caixinha, já conectou",
      "Sem fio incomodando durante o uso",
      "Estojo compacto cabe no bolso",
      "Cupom de 10% já aplicado no preço final",
    ],
    faq: [
      {
        q: "Funciona com iPhone?",
        a: "Sim, o fone é compatível com iOS e Android, basta ativar o Bluetooth do celular.",
      },
      {
        q: "Vem com cabo de carregamento?",
        a: "Sim, acompanha um cabo micro USB para recarregar o estojo.",
      },
      {
        q: "Posso usar só um lado?",
        a: "Sim, os fones funcionam de forma independente. Você pode usar apenas o direito ou o esquerdo.",
      },
      {
        q: "Tem cancelamento de ruído ativo?",
        a: "Este modelo não possui ANC, mas o encaixe ergonômico reduz naturalmente o ruído externo.",
      },
    ],
    boxContents: [
      "2x Fones Bluetooth i12 (direito e esquerdo)",
      "1x Estojo carregador",
      "1x Cabo Micro USB",
      "1x Manual de instruções",
    ],
    reviews: [
      {
        n: "Lucas F.",
        s: 5,
        t: "Pelo preço, é impressionante. Uso pra correr e nunca cai do ouvido. Bateria dura o dia todo com o case.",
      },
      {
        n: "Renata P.",
        s: 5,
        t: "Conecta rápido no meu iPhone e a qualidade da chamada é ótima. Superou minhas expectativas.",
        withPhoto: true,
      },
      {
        n: "Tiago B.",
        s: 4,
        t: "Muito bom pra escutar música e vídeos. Grave é um pouco fraco, mas dentro do esperado pra faixa de preço.",
      },
      {
        n: "Aline M.",
        s: 5,
        t: "Chegou em 3 dias, veio lacrado, sem defeitos. Já indiquei pra várias amigas.",
      },
      {
        n: "Rodrigo C.",
        s: 5,
        t: "Comprei pra usar no home office e resolveu meu problema. Consigo ficar em call andando pela casa tranquilo.",
      },
      { n: "André M.", s: 5, t: "Pareia rápido com o iPhone, chamada com áudio limpo. Bateria dura o dia todo com uso moderado.", withPhoto: true },
      { n: "Bianca L.", s: 4, t: "Som bom pro preço, grave razoável e agudos limpos. Não é premium mas é excelente pelo valor." },
      { n: "Cauã P.", s: 5, t: "Comprei dois pares, um pra mim e um pro meu irmão. Ambos funcionam perfeitamente, sem falhas." },
      { n: "Débora T.", s: 5, t: "Case carrega os fones várias vezes, muito prático. Levo pra academia e uso o dia inteiro." },
      { n: "Elias R.", s: 5, t: "Conecta automaticamente ao abrir a case, super conveniente. Detectou meu celular na hora." },
      { n: "Fabiana S.", s: 4, t: "Bom fone, cabe bem no ouvido. Só que perto de rua barulhenta ainda passa algum ruído externo." },
      { n: "Guilherme O.", s: 5, t: "Uso pra reunião no home office, o microfone capta minha voz com nitidez. Todo mundo entende." },
      { n: "Hilda N.", s: 5, t: "Bateria surpreendente, dura mais de 4h de música contínua. E carrega em 1h na case." },
      { n: "Isaac K.", s: 5, t: "Recomendo pra quem quer fone Bluetooth barato e funcional. Não é AirPods mas cumpre o papel." },
      { n: "Joana J.", s: 5, t: "Design bonitinho, parece premium. Chegou em caixa lacrada, com manual em português.", withPhoto: true },
      { n: "Kaique I.", s: 5, t: "Fone leve, quase não sinto no ouvido. Bom pra corrida também, não caiu nem uma vez." },
      { n: "Lívia H.", s: 4, t: "Bom produto, só senti que o case é um pouco grande pro bolso. Mas dá pra levar na mochila tranquilo." },
      { n: "Miguel G.", s: 5, t: "Funciona perfeito com celular Android, iPhone e notebook. Conectou em todos sem erro." },
      { n: "Natasha F.", s: 5, t: "Comprei pra viagem, ouvi música o voo inteiro sem problemas. Bateria e conforto excelentes." },
      { n: "Osvaldo E.", s: 4, t: "Fone bom, entregue rápido. Só o controle de volume via toque que demora pra pegar o comando." },
      { n: "Priscila D.", s: 5, t: "Estou apaixonada, uso pra malhar, correr, trabalhar. Já são meses de uso e continua novo." },
      { n: "Quirino C.", s: 5, t: "Preço justo, qualidade acima do esperado. Já indiquei pra 3 amigos que também compraram." },
      { n: "Renan B.", s: 5, t: "Cancela ruído passivamente pelo encaixe, dá pra ouvir música em ambiente barulhento.", withPhoto: true },
      { n: "Silvia A.", s: 5, t: "Chegou super rápido, 2 dias em São Paulo. Bem embalado, sem qualquer defeito." },
      { n: "Tobias U.", s: 5, t: "Melhor fone Bluetooth que já tive nessa faixa de preço. Vou comprar mais um par de backup." },
    ],
  },

  // ---------------- Smartwatch D20 ----------------
  "smartwatch-d20": {
    description:
      "Smartwatch D20 / Y68 com tela colorida, monitor de frequência cardíaca, oxímetro, contador de passos e notificações do celular. Compatível com Android e iOS via app. Design esportivo com pulseira de silicone confortável e resistência à água para uso diário.",
    benefits: [
      "Monitor de batimentos cardíacos e oxigenação",
      "Contador de passos, calorias e distância",
      "Notificações de WhatsApp, ligações e redes sociais",
      "Múltiplos modos esportivos",
      "Tela colorida sensível ao toque",
      "Resistente a respingos e suor",
    ],
    specs: [
      ["Modelo", "D20 / Y68"],
      ["Tela", "1.44 polegadas colorida"],
      ["Conexão", "Bluetooth 4.0"],
      ["Compatibilidade", "Android 4.4+ e iOS 8.0+"],
      ["Bateria", "Até 5 dias em uso normal"],
      ["Carregamento", "USB (cabo incluso)"],
      ["Resistência", "IP67 (respingos)"],
      ["Sensores", "Cardíaco, oxímetro, acelerômetro"],
      ["App", "FitPro / Da Fit"],
    ],
    recommendedFor:
      "Pessoas ativas, quem faz academia, corrida, caminhada e quer acompanhar métricas de saúde no dia a dia.",
    advantages: [
      "Acompanha sua saúde 24h por dia",
      "Recebe notificações direto no pulso",
      "Bateria de longa duração",
      "Design leve e discreto",
      "Cupom de 10% já aplicado no preço",
    ],
    faq: [
      {
        q: "Precisa de internet pra funcionar?",
        a: "Não. Basta parear com o celular via Bluetooth uma vez pelo app FitPro / Da Fit.",
      },
      {
        q: "Posso tomar banho com ele?",
        a: "Ele resiste a suor e respingos, mas não recomendamos usar no banho quente ou mergulhar.",
      },
      {
        q: "Funciona no iPhone?",
        a: "Sim, compatível com iOS 8.0 ou superior através do app FitPro.",
      },
      {
        q: "Responde mensagens do WhatsApp?",
        a: "Você recebe as notificações e visualiza o conteúdo, mas a resposta é feita pelo celular.",
      },
    ],
    boxContents: [
      "1x Smartwatch D20 / Y68",
      "1x Cabo USB para carregamento",
      "1x Manual de instruções em português",
    ],
    reviews: [
      {
        n: "Vinícius L.",
        s: 5,
        t: "Muito bom pelo preço. Uso pra academia e acompanho meus batimentos, funciona certinho.",
        withPhoto: true,
      },
      {
        n: "Priscila O.",
        s: 5,
        t: "Chegou rápido, fácil de configurar pelo app. Notificações do WhatsApp direto no pulso é ótimo.",
      },
      {
        n: "Guilherme R.",
        s: 4,
        t: "Cumpre o que promete. A tela poderia ser mais brilhante ao sol, mas no geral é excelente.",
      },
      {
        n: "Sabrina T.",
        s: 5,
        t: "Bonito, leve, bateria dura vários dias. Melhor custo-benefício que achei.",
      },
      {
        n: "Henrique M.",
        s: 5,
        t: "Presenteei minha esposa e ela adorou. Prático, confortável e mede batimento em tempo real.",
      },
      { n: "Alice N.", s: 5, t: "Relógio lindo, tela nítida e sensível ao toque. Pareou com o app em 1 minuto.", withPhoto: true },
      { n: "Breno L.", s: 5, t: "Meço passos, batimentos e sono. Bateria dura 5 dias com uso normal, excelente." },
      { n: "Cristiano O.", s: 4, t: "Bom smartwatch pro preço, funções básicas todas presentes. Só o GPS que depende do celular." },
      { n: "Deise P.", s: 5, t: "Notificações do WhatsApp chegam certinho, dá pra ler mensagem sem tirar o celular do bolso." },
      { n: "Elias V.", s: 5, t: "Uso na academia, mede exercício, calorias, é super preciso comparado com meu antigo Xiaomi." },
      { n: "Fátima R.", s: 5, t: "Chegou em 3 dias, com caixa lacrada, carregador magnético e manual em português. Perfeito." },
      { n: "Gabriel S.", s: 5, t: "Múltiplas pulseiras aumentam a vida útil, troco a cor conforme o look do dia. Bem versátil.", withPhoto: true },
      { n: "Helena T.", s: 4, t: "Bom relógio, só o sensor de oxigênio que varia um pouco. Mas pra uso doméstico serve bem." },
      { n: "Igor U.", s: 5, t: "Tela colorida, brilho suficiente pra ver no sol. Detecta modo esportivo automaticamente." },
      { n: "Juliana W.", s: 5, t: "Presente pro meu marido, ele adorou. Está usando todos os dias e monitorando a saúde." },
      { n: "Kevin X.", s: 5, t: "Notificação de sedentarismo é ótima, avisa pra levantar de hora em hora. Melhorei minha rotina." },
      { n: "Larissa Y.", s: 5, t: "Estilo lindo, parece um relógio de marca cara. Recebi vários elogios de amigos e colegas." },
      { n: "Mateus Z.", s: 4, t: "Bom produto, cumpre o que promete. Só a bateria que poderia ser um pouco mais durável." },
      { n: "Nathalia A.", s: 5, t: "Comprei com o cupom e saiu por metade do preço. Vale muito mesmo com desconto." },
      { n: "Otávia B.", s: 5, t: "App Da Fit é bem completo, mostra gráficos de sono, batimentos, passos. Adorei.", withPhoto: true },
      { n: "Pedro C.", s: 5, t: "Uso pra correr, mede distância certinha com o GPS do celular. Rotinas de exercício variadas." },
      { n: "Quênia D.", s: 5, t: "Contra água pra tomar banho e lavar louça sem tirar. Muito prático no dia a dia." },
      { n: "Rodrigo E.", s: 4, t: "Chegou bem embalado, funcionamento perfeito. Só o controle da câmera que demora um pouco." },
      { n: "Sabrina F.", s: 5, t: "Recomendo demais pra quem quer entrar no mundo smartwatch sem gastar muito. Vale cada centavo." },
      { n: "Tomás G.", s: 5, t: "Sensor de sono é impressionante, detecta fase profunda, leve e REM. Ajudou a melhorar meu descanso." },
    ],
  },

  // ---------------- Caixa de Som ----------------
  "caixa-som-bluetooth": {
    description:
      "Caixa de som Bluetooth portátil com som potente, graves reforçados e bateria de longa duração. Design resistente com alça, entrada USB e cartão de memória, além do Bluetooth. Ideal para churrascos, praia, camping e uso doméstico.",
    benefits: [
      "Som potente com graves reforçados",
      "Bateria com até 8h de reprodução",
      "Conexão Bluetooth, USB e cartão SD",
      "Design portátil com alça reforçada",
      "Entrada para microfone (modo karaokê)",
      "Fácil pareamento com qualquer celular",
    ],
    specs: [
      ["Conexão", "Bluetooth 5.0"],
      ["Potência", "10W RMS"],
      ["Bateria", "Recarregável 1200mAh"],
      ["Autonomia", "Até 8 horas"],
      ["Entradas", "USB, cartão SD, P2, microfone"],
      ["Alcance Bluetooth", "Até 10 metros"],
      ["Rádio FM", "Sim"],
      ["Peso", "Aproximadamente 600g"],
    ],
    recommendedFor:
      "Churrascos com amigos, praia, camping, festas em casa, home office e uso pessoal no quarto.",
    advantages: [
      "Bateria dura o dia inteiro",
      "Múltiplas formas de conexão",
      "Volume alto para ambientes abertos",
      "Fácil de transportar",
      "Cupom de 10% já aplicado no preço final",
    ],
    faq: [
      {
        q: "Vem com cabo de carregamento?",
        a: "Sim, acompanha cabo USB para recarregar a caixa de som.",
      },
      {
        q: "Toca música do pen drive?",
        a: "Sim, possui entrada USB e slot para cartão SD, além de Bluetooth e entrada P2.",
      },
      {
        q: "É à prova d'água?",
        a: "Ela é resistente a respingos leves, mas não recomendamos molhar diretamente ou levar dentro de piscina.",
      },
      {
        q: "Pode usar microfone pra karaokê?",
        a: "Sim, tem entrada P10 para microfone (microfone não incluso).",
      },
    ],
    boxContents: [
      "1x Caixa de som Bluetooth portátil",
      "1x Cabo USB para carregamento",
      "1x Cabo P2 auxiliar",
      "1x Manual em português",
    ],
    reviews: [
      {
        n: "Diego P.",
        s: 5,
        t: "Som muito alto pro tamanho, uso em churrasco e enche o quintal. Bateria dura o dia todo.",
        withPhoto: true,
      },
      {
        n: "Fernanda H.",
        s: 5,
        t: "Comprei pra levar pra praia e adorei. Conecta rápido no celular e o som é ótimo.",
      },
      {
        n: "Márcio B.",
        s: 4,
        t: "Boa caixinha, cumpre o que promete. Só achei o grave um pouco menos potente que esperava.",
      },
      {
        n: "Camila R.",
        s: 5,
        t: "Chegou super rápido e bem embalada. Uso todo dia no quarto pra dormir escutando música.",
      },
      {
        n: "Anderson L.",
        s: 5,
        t: "Vale cada centavo. Já comprei duas, uma pra casa e outra pra levar pro trabalho.",
      },
      { n: "Adriano H.", s: 5, t: "Som potente pro tamanho, enche minha sala inteira sem distorcer no volume máximo.", withPhoto: true },
      { n: "Beatriz I.", s: 5, t: "À prova d'água mesmo, usei na piscina e caiu na água, funcionou perfeitamente depois." },
      { n: "Cauê J.", s: 5, t: "Bateria dura o dia todo em churrasco, ouvi música por 10 horas sem carregar." },
      { n: "Denise K.", s: 4, t: "Boa caixa de som, grave presente. Só na praia muito ventosa que o Bluetooth às vezes falha." },
      { n: "Eloá L.", s: 5, t: "Pareou rápido com o celular, conexão estável mesmo com distância de 8 metros." },
      { n: "Felipe M.", s: 5, t: "Levo pra academia particular em casa, som firme sem chiado. Vale demais." },
      { n: "Geovana N.", s: 5, t: "Design bonito, cor preta clean. Fica lindo na estante mesmo quando não está tocando.", withPhoto: true },
      { n: "Hugo O.", s: 4, t: "Bom produto, chegou dentro do prazo. Só o cabo de carregamento que é bem curtinho." },
      { n: "Iara P.", s: 5, t: "Recomendo pra quem gosta de som potente. Enche uma sala de 30m² sem esforço." },
      { n: "Jorge Q.", s: 5, t: "Comprei durante promoção, saiu por menos da metade. Nem parece de marca genérica, som ótimo." },
      { n: "Karina R.", s: 5, t: "Funciona por USB-C, cabo padrão de celular Android moderno. Prático de carregar." },
      { n: "Léo S.", s: 5, t: "Uso no banheiro pra ouvir podcast enquanto tomo banho. Som limpo mesmo com barulho de chuveiro." },
      { n: "Marina T.", s: 4, t: "Boa caixa, mas o LED de indicação pisca muito. Fora isso, atende perfeitamente." },
      { n: "Newton U.", s: 5, t: "Levei pra praia, ficou uma tarde no sol e areia, sem problemas. Robusta demais.", withPhoto: true },
      { n: "Olga V.", s: 5, t: "Comprei pra churrasco na casa da minha mãe, todo mundo elogiou o som. Já querem uma igual." },
      { n: "Paulo W.", s: 5, t: "Presente de Natal pro meu filho, ele amou. Leva pra escola e ouve música no intervalo." },
      { n: "Quíntila X.", s: 5, t: "Tem entrada P2 auxiliar caso queira conectar via cabo. Muito versátil." },
      { n: "Rafael Y.", s: 4, t: "Som bom, atende o esperado. Só o graves que poderia ser um pouco mais forte." },
      { n: "Simone Z.", s: 5, t: "Chegou super rápido, embalada com cuidado. Já uso há 3 meses e continua novinha." },
      { n: "Tomé A.", s: 5, t: "Melhor investimento em som portátil que já fiz. Bateria dura absurdamente." },
    ],
  },

  // ---------------- Mini Liquidificador ----------------
  "mini-liquidificador": {
    description:
      "Mini liquidificador portátil recarregável via USB. Bate vitaminas, sucos e shakes em segundos direto no copo, que também vira garrafa de transporte. Lâminas em aço inox, motor silencioso e sistema de segurança que só ativa quando o copo está fechado.",
    benefits: [
      "Recarregável via USB — leve para qualquer lugar",
      "Copo com tampa que vira garrafa",
      "Lâminas em aço inoxidável de 6 pontas",
      "Motor silencioso e potente",
      "Trava de segurança automática",
      "Fácil de limpar (base à prova d'água)",
    ],
    specs: [
      ["Capacidade", "380 ml"],
      ["Potência", "40W"],
      ["Bateria", "Recarregável 1400mAh"],
      ["Rendimento por carga", "Até 15 usos"],
      ["Tempo de carga", "Cerca de 3 horas"],
      ["Entrada", "USB (cabo incluso)"],
      ["Material", "ABS + Tritan livre de BPA"],
      ["Lâminas", "Aço inox de 6 pontas"],
      ["Voltagem", "5V USB"],
    ],
    recommendedFor:
      "Quem faz dieta, treina em academia, viaja, trabalha fora ou quer praticidade para vitaminas rápidas.",
    advantages: [
      "Prepara e leva no mesmo copo",
      "Sem fios atrapalhando o uso",
      "Cabe na bolsa ou mochila",
      "Ideal para shakes proteicos e sucos detox",
      "Cupom de 10% já aplicado no preço",
    ],
    faq: [
      {
        q: "Bate gelo?",
        a: "Bate cubos pequenos de gelo já quebrados. Não recomendamos triturar gelo em pedra grande.",
      },
      {
        q: "Quantos usos aguenta com uma carga?",
        a: "Em média 15 batidas de 30 segundos com a bateria totalmente carregada.",
      },
      {
        q: "Pode lavar na máquina?",
        a: "O copo pode. A base do motor deve ser limpa apenas com pano úmido — não submergir na água.",
      },
      {
        q: "Vem carregador na tomada?",
        a: "Acompanha o cabo USB. Você pode usar o carregador do celular ou qualquer entrada USB.",
      },
    ],
    boxContents: [
      "1x Mini liquidificador portátil (base + copo)",
      "1x Tampa com bico para beber",
      "1x Cabo USB para carregamento",
      "1x Manual de instruções",
    ],
    reviews: [
      {
        n: "Isabela K.",
        s: 5,
        t: "Salvou minha dieta! Bato meu shake de whey de manhã em 30 segundos e já saio pro trabalho com o copo.",
        withPhoto: true,
      },
      {
        n: "Rafael N.",
        s: 5,
        t: "Compacto, silencioso e potente. Uso todo dia pra vitamina de banana com aveia.",
      },
      {
        n: "Yasmin O.",
        s: 4,
        t: "Muito prático, só recomendo cortar as frutas em pedaços pequenos pra bater melhor.",
      },
      {
        n: "Leandro V.",
        s: 5,
        t: "Levo pra academia todo dia. Bateria dura a semana toda sem precisar carregar.",
      },
      {
        n: "Mariana S.",
        s: 5,
        t: "Chegou bem embalado, funciona perfeitamente. Custo-benefício excelente.",
      },
      { n: "Amanda B.", s: 5, t: "Perfeito pra vitaminas de manhã, faço em 30 segundos direto no copo que já leva pro trabalho.", withPhoto: true },
      { n: "Beto C.", s: 5, t: "Portátil de verdade, cabe na mochila. Uso no trabalho pra fazer shake proteico no almoço." },
      { n: "Cida D.", s: 4, t: "Bom liquidificador, tritura banana, morango e leite tranquilamente. Gelo em cubo pequeno também." },
      { n: "Diego E.", s: 5, t: "Bateria dura várias vitaminas antes de precisar carregar. Recarrega no USB do carro." },
      { n: "Elza F.", s: 5, t: "Tampa vira copo de viagem, tomo direto sem sujar louça. Praticidade absurda." },
      { n: "Fernando G.", s: 5, t: "Motor forte pra ser tão pequeno. Vitamina fica homogênea, sem pedaços." },
      { n: "Gilda H.", s: 5, t: "Comprei pra dieta, faço smoothie de frutas todo dia. Emagreci comendo melhor.", withPhoto: true },
      { n: "Hélio I.", s: 4, t: "Bom aparelho, só recomendo não colocar gelo grande, tem que ser triturado antes." },
      { n: "Isa J.", s: 5, t: "Chegou em 2 dias, com carregador USB-C e escova de limpeza. Manual bem explicativo." },
      { n: "Jáder K.", s: 5, t: "Levo pra viagem, faço vitamina no hotel. Silencioso comparado com liquidificador normal." },
      { n: "Kléria L.", s: 5, t: "Filho de 8 anos consegue usar sozinho, tampa segura e botão único. Fácil demais." },
      { n: "Léo M.", s: 5, t: "Compact fit, cabe na porta da geladeira, leva pra academia, escritório, qualquer lugar." },
      { n: "Mércia N.", s: 4, t: "Boa qualidade. Só o copo poderia ser um pouco maior pra fazer vitamina família." },
      { n: "Nádia O.", s: 5, t: "Melhor compra do mês. Uso todos os dias e economiza tempo no meu café da manhã.", withPhoto: true },
      { n: "Odair P.", s: 5, t: "Motor firme, aguentou fazer molho de tomate com pimentão e cebola sem esforço." },
      { n: "Priscilla Q.", s: 5, t: "Cores lindas, comprei o rosa que é lindo. Fica bonito na bancada da cozinha." },
      { n: "Quirino R.", s: 5, t: "Bateria dura mais que prometido, quase uma semana com uso diário de 1 vitamina." },
      { n: "Rita S.", s: 4, t: "Bom produto, chegou bem embalado. Só o LED de bateria que poderia ser mais visível." },
      { n: "Sérgio T.", s: 5, t: "Recomendo pra qualquer pessoa que gosta de vitamina fresquinha rápida sem trabalho." },
      { n: "Talita U.", s: 5, t: "Ótima aquisição, presente pra minha irmã que também amou. Já vou comprar outro." },
    ],
  },

  // ---------------- Tênis Casual ----------------
  "tenis-casual": {
    description:
      "Tênis casual unissex branco com design minimalista, cabedal em material sintético premium e solado emborrachado antiderrapante. Palmilha macia com espuma de amortecimento e forro respirável. Combina com jeans, calça, vestido e roupas esportivas.",
    benefits: [
      "Design minimalista que combina com tudo",
      "Solado emborrachado antiderrapante",
      "Palmilha acolchoada com amortecimento",
      "Cabedal respirável",
      "Fechamento em cadarço tradicional",
      "Modelo unissex — serve para homens e mulheres",
    ],
    specs: [
      ["Estilo", "Casual clássico"],
      ["Gênero", "Unissex"],
      ["Cor", "Branco"],
      ["Material do cabedal", "Sintético premium"],
      ["Solado", "Borracha antiderrapante"],
      ["Palmilha", "EVA com espuma de amortecimento"],
      ["Numeração", "34 ao 43"],
      ["Fechamento", "Cadarço"],
    ],
    recommendedFor:
      "Uso casual, faculdade, trabalho descontraído, passeios, viagens e composição de looks urbanos.",
    advantages: [
      "Confortável para usar o dia todo",
      "Fácil de combinar com qualquer roupa",
      "Solado com boa aderência",
      "Modelo atemporal, nunca sai de moda",
      "Cupom de 10% já aplicado no preço",
    ],
    faq: [
      {
        q: "O tênis calça no número normal?",
        a: "Sim, veste no tamanho brasileiro padrão. Se você geralmente calça 38, peça 38.",
      },
      {
        q: "É bom pra caminhada?",
        a: "É indicado para uso casual e caminhadas leves. Para corrida ou academia intensa recomendamos um tênis esportivo específico.",
      },
      {
        q: "O branco amarela com o tempo?",
        a: "Com boa higienização periódica, mantém a cor por bastante tempo. Recomendamos limpar com pano úmido e sabão neutro.",
      },
      {
        q: "Serve para homem e mulher?",
        a: "Sim, é um modelo unissex. Basta escolher a numeração correta.",
      },
    ],
    boxContents: [
      "1x Par de tênis casual branco",
      "1x Par de cadarços extras",
      "1x Caixa original com nota fiscal",
    ],
    reviews: [
      {
        n: "Gabriela A.",
        s: 5,
        t: "Sapato lindo, chegou super rápido. Serviu certinho no meu número, muito confortável desde o primeiro uso.",
        withPhoto: true,
      },
      {
        n: "Pedro H.",
        s: 5,
        t: "Estava procurando um tênis branco básico e esse é perfeito. Combina com tudo.",
      },
      {
        n: "Larissa V.",
        s: 4,
        t: "Muito bonito, só precisei usar um par de meias mais grossas nos primeiros dias pra amaciar.",
      },
      {
        n: "Matheus D.",
        s: 5,
        t: "Custo-benefício ótimo. Ando muito no trabalho e não machuca o pé.",
      },
      {
        n: "Bruna E.",
        s: 5,
        t: "Recebi antes do prazo, embalagem lacrada, sapato impecável. Já comprei outro par.",
      },
      { n: "Alexandre V.", s: 5, t: "Tênis confortável do primeiro dia, sem calo nem bolha. Andei o dia inteiro sem cansar os pés.", withPhoto: true },
      { n: "Bruna W.", s: 5, t: "Amortecimento macio de verdade, uso pra caminhada e trabalho. Recomendo demais." },
      { n: "Caio X.", s: 4, t: "Bom tênis, ficou bem no meu pé. Só a numeração que ficou um pouquinho pequena, pediria um número acima." },
      { n: "Dulce Y.", s: 5, t: "Comprei na cor preta, elegante e combina com tudo. Uso pra trabalhar e passeio." },
      { n: "Enzo Z.", s: 5, t: "Solado antiderrapante funciona bem, andei em piso molhado sem escorregar." },
      { n: "Fabíola A.", s: 5, t: "Chegou em 4 dias em Fortaleza, super bem embalado com caixa da marca original." },
      { n: "Getúlio B.", s: 5, t: "Já é meu segundo par, o primeiro durou 2 anos de uso diário. Excelente durabilidade.", withPhoto: true },
      { n: "Heloisa C.", s: 4, t: "Confortável, bonito. Só o cadarço que poderia ser um pouquinho mais longo pra dar laço grande." },
      { n: "Ícaro D.", s: 5, t: "Uso no trabalho o dia todo em pé, pés não doem no final do expediente. Vale cada real." },
      { n: "Jéssica E.", s: 5, t: "Presente pro meu namorado, ele amou. Falou que é o tênis mais confortável que ele já teve." },
      { n: "Kaique F.", s: 5, t: "Design moderno, discreto mas com estilo. Combina com jeans, calça social, tudo." },
      { n: "Ligia G.", s: 5, t: "Muito leve, quase não sinto no pé. Bom pra quem anda muito ou pega transporte público." },
      { n: "Manuel H.", s: 4, t: "Bom produto. Só o material da parte de cima que é meio brilhante demais, prefiro fosco." },
      { n: "Nádia I.", s: 5, t: "Palmilha macia e removível, dá pra colocar minha ortopédica sem problema. Perfeito." },
      { n: "Otávio J.", s: 5, t: "Comprei durante promoção, saiu por metade do preço de tênis de marca. Custo-benefício absurdo.", withPhoto: true },
      { n: "Pâmela K.", s: 5, t: "Uso pra academia leve e caminhada. Amortecimento aguenta bem sem deformar." },
      { n: "Quirze L.", s: 5, t: "Chegou dentro da caixa original, com etiquetas e manual. Nota fiscal impressa também." },
      { n: "Renilda M.", s: 4, t: "Bom tênis, atende bem. Só sugiro escolher um número acima do usual, veste um pouco justo." },
      { n: "Samuel N.", s: 5, t: "Já indiquei pra 5 amigos, todos compraram e adoraram. Tênis surpreendente pelo preço." },
      { n: "Tereza O.", s: 5, t: "Comprei branco e mesmo depois de meses de uso continua bonito. Fácil de limpar com pano úmido." },
    ],
  },

  // ---------------- Perfume Importado ----------------
  "perfume-importado": {
    description:
      "Perfume feminino importado 100ml com fragrância marcante, notas florais frutadas de saída, coração amadeirado e fundo de baunilha. Fixação de longa duração no corpo e nas roupas. Frasco elegante ideal para presente ou uso próprio.",
    benefits: [
      "Fragrância marcante e sofisticada",
      "Alta fixação (até 8 horas)",
      "100 ml — rende muito tempo de uso",
      "Notas florais, frutadas e amadeiradas",
      "Frasco luxuoso ideal para presente",
      "Produto lacrado com nota fiscal",
    ],
    specs: [
      ["Tipo", "Eau de Parfum"],
      ["Volume", "100 ml"],
      ["Gênero", "Feminino"],
      ["Família olfativa", "Floral frutado amadeirado"],
      ["Fixação", "Alta (até 8 horas)"],
      ["Projeção", "Média a alta"],
      ["Ocasião", "Uso diurno e noturno"],
      ["Estação", "Todas as estações"],
    ],
    recommendedFor:
      "Presente de aniversário, dia das mães, namoradas, e para quem busca uma fragrância marcante para o dia a dia ou eventos especiais.",
    advantages: [
      "Fragrância importada com fixação superior",
      "Frasco grande de 100ml, rende meses de uso",
      "Embalagem elegante pronta para presentear",
      "Produto lacrado e original",
      "Cupom de 10% já aplicado no preço",
    ],
    faq: [
      {
        q: "O perfume é original?",
        a: "Sim, é 100% original, importado, lacrado de fábrica e acompanha nota fiscal.",
      },
      {
        q: "Qual a fixação?",
        a: "A fixação é alta, dura em média de 6 a 8 horas na pele e ainda mais nas roupas.",
      },
      {
        q: "Serve para qual ocasião?",
        a: "É versátil — funciona bem no trabalho, em encontros à noite, festas e no dia a dia.",
      },
      {
        q: "Vem com caixa?",
        a: "Sim, o perfume vem lacrado dentro da caixa original com plástico celofane de fábrica.",
      },
    ],
    boxContents: [
      "1x Perfume feminino 100ml lacrado",
      "1x Caixa original",
      "1x Nota fiscal eletrônica",
    ],
    reviews: [
      {
        n: "Vanessa L.",
        s: 5,
        t: "Cheiro maravilhoso e fixa o dia inteiro. Ganhei vários elogios no trabalho. Recomendo demais!",
        withPhoto: true,
      },
      {
        n: "Camila R.",
        s: 5,
        t: "Comprei pra minha mãe de presente, ela amou. Frasco lindo e cheiro sofisticado.",
      },
      {
        n: "Talita P.",
        s: 4,
        t: "Perfume ótimo, entrega rápida. A fragrância é bem doce, quem gosta desse estilo vai amar.",
      },
      {
        n: "Beatriz M.",
        s: 5,
        t: "Chegou lacrado, com nota fiscal e caixa perfeita. Fixação incrível, já é meu preferido.",
      },
      {
        n: "Juliana K.",
        s: 5,
        t: "Melhor perfume que já comprei nessa faixa de preço. Uso todo dia.",
      },
      { n: "Aline P.", s: 5, t: "Fragrância marcante, dura o dia todo na minha pele. Recebo elogios em todo lugar que passo.", withPhoto: true },
      { n: "Bruno Q.", s: 5, t: "Comprei o masculino, cheiro amadeirado sofisticado. Uso no trabalho e balada." },
      { n: "Célia R.", s: 4, t: "Perfume bom, cheiro agradável. Só a fixação que na minha pele oleosa dura menos, mas ainda bom." },
      { n: "Diego S.", s: 5, t: "Embalado com muito cuidado, veio dentro de caixa de proteção com plástico bolha. Vidro intacto." },
      { n: "Elisa T.", s: 5, t: "Frasco bonito, parece perfume caro de loja de luxo. Adorei o design da tampa." },
      { n: "Fabrício U.", s: 5, t: "Fixação de 8 horas na minha pele, aplico de manhã e à noite ainda sinto no meu pescoço." },
      { n: "Gisele V.", s: 5, t: "Chegou lacrado, com selo de importação e nota fiscal. Original mesmo, sem dúvida.", withPhoto: true },
      { n: "Hélcio W.", s: 4, t: "Bom perfume, chegou rápido. Só a projeção que poderia ser um pouco mais forte no início." },
      { n: "Isadora X.", s: 5, t: "Presente pra minha mãe, ela amou. Falou que é o melhor perfume que já ganhou." },
      { n: "Júlio Y.", s: 5, t: "Cheiro doce sem enjoar, feminino sem ser infantil. Perfeito pra dia e noite." },
      { n: "Karla Z.", s: 5, t: "Recomendo demais, já comprei 3 vezes o mesmo. Vira meu perfume de assinatura." },
      { n: "Lucas A.", s: 5, t: "Fragrância diferente das que se vende em farmácia. Cheiro exclusivo, ninguém tem igual." },
      { n: "Márcia B.", s: 4, t: "Bom produto, atende. Só o borrifador que tem que apertar com força pra sair spray bom." },
      { n: "Nereu C.", s: 5, t: "Comprei pra viagem de casamento, minha esposa amou. Cheiro marcante e elegante.", withPhoto: true },
      { n: "Ondina D.", s: 5, t: "Já é o terceiro que compro dessa loja, sempre chega original e bem embalado. Confiança total." },
      { n: "Pierre E.", s: 5, t: "Cheiro sofisticado que dura no ambiente também, quando entra em uma sala perfuma tudo." },
      { n: "Quíntia F.", s: 5, t: "Comprei com cupom, saiu por menos que na farmácia. Vale muito o preço, super satisfeita." },
      { n: "Rui G.", s: 4, t: "Perfume bom, entregue no prazo. Só que gostaria de mais opções de tamanho, esse é grande demais." },
      { n: "Silmara H.", s: 5, t: "Meu marido usou uma vez e disse que é o melhor perfume dele. Agora ele quer comprar mais." },
      { n: "Tércio I.", s: 5, t: "Chegou perfeito, sem vazamento. Frasco original com todos os detalhes da embalagem." },
    ],
  },
};
