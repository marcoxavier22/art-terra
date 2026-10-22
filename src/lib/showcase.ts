/**
 * Interactive presentation per product line (category page, above the grid).
 * Content is editorial; products and photos still come from the admin.
 */
export type ShowcaseKind = 'models' | 'compare' | 'planner';

export interface ShowcaseConfig {
  kind: ShowcaseKind;
  eyebrow: string;
  title: string;
  intro: string;
  /** product slugs shown first (others with photos follow) */
  featured?: string[];
  /** product slug prefix for the compare / planner variants */
  match?: string;
  /** short persuasive copy per product slug */
  copy?: Record<string, { tag: string; text: string }>;
}

export const SHOWCASE: Record<string, ShowcaseConfig> = {
  cobogos: {
    kind: 'models',
    eyebrow: 'Escolha o desenho',
    title: 'Veja cada cobogó na parede',
    intro:
      'Toque em um modelo e deslize para ver a peça isolada, aplicada em obra e em projetos reais.',
    featured: ['cobogo-arabe', 'cobogo-assimetrico', 'cobogo-boomerang'],
  },
  pisos: {
    kind: 'models',
    eyebrow: 'Escolha o piso',
    title: 'Compare os desenhos de piso',
    intro: 'Toque em um modelo para ver a peça de perto e onde ela funciona melhor.',
  },
  atermicos: {
    kind: 'compare',
    eyebrow: 'Bordas lado a lado',
    title: 'Qual borda combina com a sua piscina?',
    intro: 'Compare o perfil de cada borda e toque em “Aplicada” para ver o resultado na piscina.',
    match: 'borda-',
    copy: {
      'borda-grega': {
        tag: 'Encaixe com dente',
        text: 'O dente encaixa na borda da piscina e deixa o acabamento firme e alinhado. Quinas em 45º ou triângulo, em 9 larguras de 15 a 55 cm.',
      },
      'borda-peito-de-pombo': {
        tag: 'Para curvas e cantos',
        text: 'Contorno arredondado que abraça a borda, com peças próprias de canto e de curva. A escolha certa para piscinas de formato orgânico.',
      },
      'borda-reta': {
        tag: 'Visual minimalista',
        text: 'Sem dente, sobreposta à borda: linhas limpas para projetos contemporâneos. Quinas em 45º ou triângulo, em 9 larguras de 15 a 55 cm.',
      },
    },
  },
  artificios: {
    kind: 'planner',
    eyebrow: 'Monte seu espaço',
    title: 'Quantos bancos cabem no seu jardim?',
    intro:
      'Escolha os bancos, informe o comprimento disponível e veja em escala se tudo cabe antes de pedir o orçamento.',
    match: 'banco-',
  },
};

/** "192x42 cm" → { comprimento: 192, profundidade: 42 } */
export function parseFootprint(
  valor: string | undefined,
): { comprimento: number; profundidade: number } | null {
  if (!valor) return null;
  const m = valor.replace(',', '.').match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  if (!m) return null;
  return { comprimento: Number(m[1]), profundidade: Number(m[2]) };
}

/** Total length in cm of `counts` benches in a row, with `gap` cm between neighbours. */
export function rowLength(itens: { comprimento: number; qtd: number }[], gap: number): number {
  const pieces = itens.reduce((n, i) => n + i.qtd, 0);
  const sum = itens.reduce((n, i) => n + i.comprimento * i.qtd, 0);
  return pieces > 0 ? sum + gap * (pieces - 1) : 0;
}
