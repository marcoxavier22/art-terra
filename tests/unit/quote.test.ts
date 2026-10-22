import { describe, expect, it } from 'vitest';
import {
  defaultUnidade,
  parseStoredItems,
  quoteKey,
  quoteMessage,
  type QuoteItem,
} from '@/lib/quote';
import { usosDoProduto } from '@/lib/usos';

const item = (over: Partial<QuoteItem> = {}): QuoteItem => ({
  key: 'k',
  produtoId: 'p1',
  nome: 'Cobogó Círculo',
  href: '/catalogo/cobogos/cobogo-circulo',
  imagem: null,
  cor: null,
  medida: null,
  quantidade: null,
  unidade: 'm²',
  ...over,
});

describe('quoteMessage', () => {
  it('lista itens numerados com medida, cor e quantidade', () => {
    const msg = quoteMessage(
      [
        item({ medida: '39x39x7', cor: 'Branco', quantidade: 20 }),
        item({ nome: 'Paver', quantidade: 12.5, unidade: 'm²' }),
        item({ nome: 'Banco', unidade: 'peças' }),
      ],
      { nome: ' Ana ', cidade: 'Volta Redonda', observacoes: '' },
    );
    expect(msg).toBe(
      [
        'Olá! Vim pelo site da Art Terra e gostaria de um orçamento para:',
        '',
        '1. Cobogó Círculo (39x39x7 · Branco) — 20 m²',
        '2. Paver — 12,5 m²',
        '3. Banco',
        '',
        'Nome: Ana',
        'Cidade da obra: Volta Redonda',
      ].join('\n'),
    );
  });
});

describe('parseStoredItems', () => {
  it('descarta lixo e links fora do catálogo', () => {
    const out = parseStoredItems([
      { produtoId: 'a', nome: 'A', href: '/catalogo/x/a', unidade: 'xx', quantidade: -1 },
      { produtoId: 'b', nome: 'B', href: 'https://evil.example' },
      null,
      'x',
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      unidade: 'peças',
      quantidade: null,
      key: quoteKey('a', null, null),
    });
    expect(parseStoredItems({})).toEqual([]);
  });
});

describe('defaultUnidade', () => {
  it('usa m² quando há rendimento por m² e metros para peças lineares', () => {
    expect(defaultUnidade({ rendimento_pecas_m2: 7, rendimento: '07 pç/m²' })).toBe('m²');
    expect(defaultUnidade({ rendimento_pecas_m2: null, rendimento: '2 pç/metro linear' })).toBe(
      'metros',
    );
    expect(defaultUnidade({ rendimento_pecas_m2: null, rendimento: null })).toBe('peças');
  });
});

describe('usosDoProduto', () => {
  const cat = (slug: string, nome: string) => ({
    id: '1',
    slug,
    nome,
    descricao: null,
    imagem_capa_url: null,
    ordem: 1,
    ativo: true,
  });
  it('classifica pelo nome, aplicação e linha', () => {
    expect(
      usosDoProduto({
        nome: 'Borda Grega',
        aplicacao: null,
        categoria: cat('atermicos', 'Linha Atérmica'),
      }),
    ).toContain('piscina');
    expect(
      usosDoProduto({
        nome: 'Cobogó Floral',
        aplicacao: 'Fachadas e muros',
        categoria: cat('cobogos', 'Cobogós'),
      }),
    ).toContain('fachada');
    expect(
      usosDoProduto({ nome: 'Paver', aplicacao: 'Garagens', categoria: cat('pisos', 'Pisos') }),
    ).toEqual(['calcada']);
  });
});
