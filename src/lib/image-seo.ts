import { normalizeText } from './text';
import type { GaleriaItem, Produto } from './types';

type ProdutoImg = Pick<Produto, 'nome' | 'medidas' | 'aplicacao' | 'categoria'>;

/**
 * Descriptive alt text for product photos (Google Images reads alt + file name + nearby text).
 * Neutral wording so it reads well for "Borda…" (fem.) and "Cobogó…" (masc.) alike.
 */
export function productImageAlt(
  produto: ProdutoImg,
  kind: 'peca' | 'aplicacao' | 'extra',
  index = 0,
): string {
  const medida = produto.medidas.length === 1 ? produto.medidas[0]!.valor : null;
  const linha = produto.categoria.nome.toLowerCase();
  if (kind === 'peca') {
    return `${produto.nome}${medida ? ` ${medida}` : ''}: peça de concreto da linha ${linha} Art Terra`;
  }
  if (kind === 'aplicacao') {
    return `Obra com ${produto.nome}${produto.aplicacao ? `: ${lowerFirst(produto.aplicacao)}` : ''}`;
  }
  return `${produto.nome}, linha ${linha} Art Terra: foto ${index + 1}`;
}

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Every photo of a product, in display order, with its alt and a short caption. */
export function productImages(produto: Produto) {
  return [
    produto.imagem_principal_url
      ? {
          src: produto.imagem_principal_url,
          alt: productImageAlt(produto, 'peca'),
          caption: produto.nome,
          kind: 'peca' as const,
        }
      : null,
    produto.imagem_aplicacao_url
      ? {
          src: produto.imagem_aplicacao_url,
          alt: productImageAlt(produto, 'aplicacao'),
          caption: `${produto.nome}: aplicação`,
          kind: 'aplicacao' as const,
        }
      : null,
    ...produto.imagens_extras.map((src, i) => ({
      src,
      alt: productImageAlt(produto, 'extra', i),
      caption: `${produto.nome}: foto ${i + 2}`,
      kind: 'extra' as const,
    })),
  ].filter((v) => v !== null);
}

/** Gallery photos that belong to a product line, matched by their caption/alt text. */
const LINE_KEYWORDS: Record<string, RegExp> = {
  atermicos: /piscina|borda|atermic/,
  cobogos: /cobogo|fachada|muro|vazado/,
  pisos: /piso|calcada|caminho|varanda|garagem/,
  artificios: /jardim|banco|varanda|caminho/,
};

export function galleryForLine(galeria: GaleriaItem[], categoriaSlug: string): GaleriaItem[] {
  const re = LINE_KEYWORDS[categoriaSlug];
  if (!re) return [];
  return galeria.filter((g) => re.test(normalizeText(`${g.legenda ?? ''} ${g.alt}`)));
}
