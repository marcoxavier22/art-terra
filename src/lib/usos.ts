import { normalizeText } from './text';
import type { Produto } from './types';

/**
 * "Where will you use it?" — the way buyers actually search (piscina, muro, calçada…).
 * Derived from category + recommended application, so the admin has nothing extra to fill in.
 */
export const USOS = [
  {
    slug: 'piscina',
    nome: 'Piscina',
    titulo: 'Área de piscina',
    descricao: 'Bordas, pisos atérmicos e grelhas',
  },
  {
    slug: 'fachada',
    nome: 'Fachada e muro',
    titulo: 'Fachadas, muros e divisórias',
    descricao: 'Cobogós e capas de muro',
  },
  {
    slug: 'calcada',
    nome: 'Calçada e garagem',
    titulo: 'Calçadas, garagens e acessos',
    descricao: 'Pisos de calçada, pavers, drenante e tátil',
  },
  {
    slug: 'jardim',
    nome: 'Jardim',
    titulo: 'Jardins e paisagismo',
    descricao: 'Pisantes, piso grama e bancos',
  },
] as const;

export type UsoSlug = (typeof USOS)[number]['slug'];

const RULES: Record<UsoSlug, RegExp> = {
  piscina: /piscina|borda|grelha|atermic/,
  fachada: /muro|fachada|divisori|pingadeira|rufo|cobogo/,
  calcada: /calcada|garage|veicul|paver|tatil|drenante|passeio/,
  jardim: /jardi|gramado|grama|banco|pisante|margarida|pezao/,
};

export function usosDoProduto(
  produto: Pick<Produto, 'nome' | 'aplicacao' | 'categoria'>,
): UsoSlug[] {
  const text = normalizeText(
    [produto.nome, produto.aplicacao ?? '', produto.categoria.slug, produto.categoria.nome].join(
      ' ',
    ),
  );
  return USOS.filter((u) => RULES[u.slug].test(text)).map((u) => u.slug);
}

export function isUsoSlug(value: string | null | undefined): value is UsoSlug {
  return USOS.some((u) => u.slug === value);
}
