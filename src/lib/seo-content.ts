/**
 * Editorial copy for the indexable category pages (/catalogo/[categoria]).
 * Categories created later in the admin fall back to their own description.
 */
export interface Faq {
  pergunta: string;
  resposta: string;
}

export interface CategoriaSeo {
  /** <title> without the brand suffix (≤ ~45 chars). */
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  usos: string[];
  faqs: Faq[];
}

export const CIDADES_ATENDIDAS = [
  'Pinheiral',
  'Volta Redonda',
  'Barra Mansa',
  'Barra do Piraí',
  'Piraí',
  'Resende',
  'Porto Real',
  'Quatis',
  'Itatiaia',
  'Valença',
  'Rio Claro',
  'Vassouras',
] as const;

export const CATEGORIA_SEO: Record<string, CategoriaSeo> = {
  atermicos: {
    title: 'Borda Atérmica e Piso Atérmico para Piscina',
    h1: 'Bordas e pisos atérmicos para piscina',
    metaDescription:
      'Borda grega, borda reta, peito de pombo, grelha e piso atérmico direto da fábrica em Pinheiral/RJ. 5 cores, várias medidas. Orçamento pelo WhatsApp.',
    intro:
      'A linha atérmica da Art Terra foi feita para a área da piscina: as peças absorvem menos calor que outras superfícies, então dá para andar descalço mesmo sob sol forte, e a textura levemente porosa garante aderência com os pés molhados. Fabricamos bordas com e sem dente, peças de canto e curva, grelhas para dreno e piso atérmico nas medidas mais usadas em obra.',
    usos: [
      'Borda de piscina de alvenaria, vinil ou fibra',
      'Piso do entorno da piscina e do deck',
      'Áreas externas com muita exposição ao sol',
      'Cobertura de drenos e ralos lineares',
    ],
    faqs: [
      {
        pergunta: 'Borda atérmica esquenta no sol?',
        resposta:
          'Esquenta bem menos que pedras e cerâmicas comuns. A composição do concreto atérmico absorve menos calor, o que deixa a superfície mais amena para caminhar descalço.',
      },
      {
        pergunta: 'Qual a diferença entre borda grega e borda reta?',
        resposta:
          'A borda grega tem um dente para encaixe na borda da piscina; a borda reta não tem dente e é sobreposta. As duas podem ter quinas em 45º ou em triângulos e são fabricadas de 15x100 a 55x100 cm.',
      },
      {
        pergunta: 'Quais cores estão disponíveis na linha atérmica?',
        resposta: 'Areia/Marfim, Branco, Chocolate, Cinza e Preto. Outras cores sob consulta.',
      },
      {
        pergunta: 'Vocês fazem peças de canto e curva?',
        resposta:
          'Sim. A Borda Peito de Pombo tem peça reta (35x50), peça de canto (43x43) e peças curvas (35x85 e 35x105). Para outros modelos, envie o desenho da piscina pelo WhatsApp.',
      },
    ],
  },
  cobogos: {
    title: 'Cobogó de Concreto: 12 Modelos de Fábrica',
    h1: 'Cobogós de concreto',
    metaDescription:
      'Cobogós de concreto 39x39 e 30x30 em 12 modelos (círculo, floral, árabe, folha, U com floreira…). Natural ou branco, direto da fábrica em Pinheiral/RJ.',
    intro:
      'O cobogó é o elemento vazado que deixa a luz e o vento passarem sem abrir mão da privacidade. Fabricamos 12 modelos de cobogó de concreto, de desenhos clássicos como o círculo e o floral a peças contemporâneas como o L e o assimétrico, nas medidas 39x39x7 cm (7 peças por m²) e 30x30x7 cm (12 peças por m²).',
    usos: [
      'Fachadas e muros com ventilação',
      'Divisórias de ambientes internos',
      'Áreas de serviço e churrasqueiras',
      'Jardins verticais (Cobogó U com floreira)',
    ],
    faqs: [
      {
        pergunta: 'Quantos cobogós vão por metro quadrado?',
        resposta:
          'Os modelos 39x39x7 rendem 7 peças por m² e os modelos 30x30x7 rendem 12 peças por m². Na página de cada modelo há uma calculadora com margem de perda.',
      },
      {
        pergunta: 'Qual a diferença entre uma face e dupla face?',
        resposta:
          'O cobogó de dupla face tem acabamento igual dos dois lados, ideal para divisórias vistas de ambos os ambientes. O de uma face tem um lado de acabamento e é indicado para fachadas e muros.',
      },
      {
        pergunta: 'Cobogó de concreto pode ser usado em área interna?',
        resposta:
          'Pode. Os modelos de dupla face são os mais usados como divisória entre sala, cozinha e varanda.',
      },
    ],
  },
  pisos: {
    title: 'Pisos de Concreto para Calçada, Garagem e Jardim',
    h1: 'Pisos de concreto para áreas externas',
    metaDescription:
      'Piso de calçada 33x33, paver intertravado, piso drenante, piso grama, piso dormente madeirado e piso tátil. Fábrica em Pinheiral/RJ, entrega no Sul Fluminense.',
    intro:
      'Pisos de concreto feitos para durar em calçadas, garagens e jardins: resistem ao alto fluxo e às variações de clima e têm manutenção simples. Temos piso de calçada 33x33 em cinco desenhos, paver intertravado, piso drenante que deixa a água infiltrar, piso grama para estacionamentos verdes, piso dormente com acabamento madeirado e piso tátil de alerta e direcional.',
    usos: [
      'Calçadas e passeios públicos',
      'Garagens e acessos de veículos',
      'Caminhos de jardim',
      'Sinalização tátil de acessibilidade',
    ],
    faqs: [
      {
        pergunta: 'Quantas peças de piso de calçada 33x33 vão por m²?',
        resposta: 'São 9 peças por m², já considerando o rejuntamento.',
      },
      {
        pergunta: 'Qual piso aguenta passagem de carro?',
        resposta:
          'O paver intertravado (10x20x6) é indicado para garagens e passagens de veículos. O piso grama também pode receber veículos na versão reforçada com ferragens.',
      },
      {
        pergunta: 'Como funciona o piso drenante?',
        resposta:
          'É um piso de concreto poroso: a água da chuva atravessa a peça e infiltra no solo, reduzindo poças e enxurradas. Medida 50x50x3, 4 peças por m².',
      },
      {
        pergunta: 'Vocês fabricam piso tátil?',
        resposta:
          'Sim, piso tátil de alerta e direcional nas medidas 20x20x6, 25x25x2,5 e 33x33x2,5, em cinco cores.',
      },
    ],
  },
  artificios: {
    title: 'Bancos, Pisantes e Capas de Muro de Concreto',
    h1: 'Artefatos de concreto para jardim e muro',
    metaDescription:
      'Bancos de concreto, pisantes Margarida e Pé Grande, pingadeiras e capas de muro (rufo). Peças de fábrica em Pinheiral/RJ para jardins e acabamento de muros.',
    intro:
      'Peças de concreto que completam o projeto: bancos para jardins e varandas, pisantes decorativos para marcar caminhos no gramado e pingadeiras (capas de muro ou rufos) que protegem o topo do muro da chuva e dão acabamento à alvenaria.',
    usos: [
      'Bancos para jardins, praças e varandas',
      'Pisantes decorativos em gramados',
      'Acabamento e proteção do topo de muros',
    ],
    faqs: [
      {
        pergunta: 'Qual a diferença entre pingadeira chapéu e pingadeira reta?',
        resposta:
          'A pingadeira chapéu tem caimento para os dois lados e escoa a água para fora do muro; a reta tem superfície plana. Ambas têm 80 cm de comprimento.',
      },
      {
        pergunta: 'Os bancos de concreto podem ficar no tempo?',
        resposta:
          'Sim. São peças de concreto pensadas para jardins, praças e varandas, expostas ao sol e à chuva.',
      },
      {
        pergunta: 'Os artefatos têm outras cores?',
        resposta: 'São fabricados na cor natural do concreto. Outras cores sob consulta.',
      },
    ],
  },
};

export const HOME_FAQS: Faq[] = [
  {
    pergunta: 'A Art Terra vende direto da fábrica?',
    resposta:
      'Sim. Fabricamos todas as peças na nossa unidade em Pinheiral/RJ e vendemos direto para obras, construtoras, paisagistas, arquitetos e revendas.',
  },
  {
    pergunta: 'Como faço um orçamento?',
    resposta:
      'Monte sua lista no catálogo com os produtos, medidas, cores e quantidades e envie pelo WhatsApp. Respondemos com preço, prazo e frete.',
  },
  {
    pergunta: 'Quais cidades vocês atendem?',
    resposta: `Atendemos todo o Sul Fluminense, incluindo ${CIDADES_ATENDIDAS.slice(0, -1).join(', ')} e ${CIDADES_ATENDIDAS.at(-1)}. Para outras regiões, consulte o frete.`,
  },
  {
    pergunta: 'Posso visitar a fábrica?',
    resposta:
      'Pode, e recomendamos: ver as peças de perto ajuda a escolher cor e textura. Estamos na Estrada Benjamin Constant, 4805, Mutirão (Km 5), Pinheiral/RJ.',
  },
];
