import { describe, expect, it } from 'vitest';
import { galleryForLine, productImageAlt } from '@/lib/image-seo';
import { parseFootprint, rowLength } from '@/lib/showcase';

const cat = { id: 'c', slug: 'cobogos', nome: 'Cobogós', ordem: 1 };

describe('productImageAlt', () => {
  it('descreve peça com medida e aplicação sem gênero', () => {
    const p = {
      nome: 'Cobogó Árabe',
      medidas: [{ rotulo: null, valor: '39x39x07' }],
      aplicacao: 'Fachadas e muros',
      categoria: cat,
    };
    expect(productImageAlt(p, 'peca')).toBe(
      'Cobogó Árabe 39x39x07: peça de concreto da linha cobogós Art Terra',
    );
    expect(productImageAlt(p, 'aplicacao')).toBe('Obra com Cobogó Árabe: fachadas e muros');
  });
});

describe('galleryForLine', () => {
  it('separa fotos da galeria por linha pelo texto', () => {
    const g = (alt: string) => ({
      id: alt,
      imagem_url: '/x.webp',
      legenda: null,
      alt,
      ordem: 1,
      ativo: true,
    });
    const items = [g('Piscina com borda atérmica'), g('Muro de cobogós'), g('Caminho de jardim')];
    expect(galleryForLine(items, 'atermicos').map((i) => i.alt)).toEqual([
      'Piscina com borda atérmica',
    ]);
    expect(galleryForLine(items, 'cobogos').map((i) => i.alt)).toEqual(['Muro de cobogós']);
    expect(galleryForLine(items, 'inexistente')).toEqual([]);
  });
});

describe('planejador de bancos', () => {
  it('lê medidas e soma comprimento com espaçamento', () => {
    expect(parseFootprint('192x42 cm')).toEqual({ comprimento: 192, profundidade: 42 });
    expect(parseFootprint('sem medida')).toBeNull();
    expect(
      rowLength(
        [
          { comprimento: 120, qtd: 2 },
          { comprimento: 100, qtd: 1 },
        ],
        60,
      ),
    ).toBe(460);
    expect(rowLength([], 60)).toBe(0);
  });
});
