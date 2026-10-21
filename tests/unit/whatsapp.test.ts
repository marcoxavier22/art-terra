import { describe, expect, it } from 'vitest';
import { contactMessage, productMessage, whatsappUrl } from '@/lib/whatsapp';

describe('productMessage', () => {
  it('uses the exact default text from the briefing', () => {
    expect(productMessage('Cobogó Círculo')).toBe(
      'Olá! Tenho interesse no produto Cobogó Círculo. Poderia me passar um orçamento?',
    );
  });
  it('adds the chosen size and colour', () => {
    expect(productMessage('Borda Grega', { medida: '30x100', cor: 'Branco' })).toBe(
      'Olá! Tenho interesse no produto Borda Grega (medida 30x100, cor Branco). Poderia me passar um orçamento?',
    );
  });
});

describe('whatsappUrl', () => {
  it('builds a wa.me link with only digits and an encoded message', () => {
    expect(whatsappUrl('+55 (24) 99201-1676')).toBe('https://wa.me/5524992011676');
    const url = whatsappUrl('5524992011676', 'Olá! Cobogó & piso?');
    expect(url.startsWith('https://wa.me/5524992011676?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Olá! Cobogó & piso?');
  });
});

describe('contactMessage', () => {
  it('includes what the visitor typed and skips empty fields', () => {
    const text = contactMessage({
      nome: 'Maria',
      telefone: '(24) 99999-0000',
      email: '',
      assunto: 'Orçamento',
      mensagem: 'Preciso de 40 m² de piso drenante.',
    });
    expect(text).toContain('Maria');
    expect(text).toContain('Assunto: Orçamento');
    expect(text).toContain('40 m²');
    expect(text).not.toContain('E-mail');
  });
});
