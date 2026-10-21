import { describe, expect, it } from 'vitest';
import { configuracoesSchema, fieldErrorsFrom, produtoSchema } from '@/lib/validation/admin';
import { contactSchema } from '@/lib/validation/contact';

const produto = {
  categoria_id: '3f2b1c9e-8f4a-4d7b-9c1e-2a6b5d4c3e21',
  nome: 'Cobogó Teste',
  slug: 'cobogo-teste',
  descricao: '',
  medidas: [{ rotulo: '', valor: '39x39x07' }],
  rendimento: '07 pç/m²',
  rendimento_pecas_m2: '7',
  face: 'uma_face',
  observacao_face: '',
  aplicacao: '',
  observacoes: '',
  cores: [],
  imagem_principal_url: null,
  imagem_aplicacao_url: null,
  imagens_extras: [],
  ativo: true,
  destaque: false,
};

describe('produtoSchema', () => {
  it('accepts a valid product', () => {
    expect(produtoSchema.safeParse(produto).success).toBe(true);
  });
  it('requires name and category, with messages in Portuguese', () => {
    const result = produtoSchema.safeParse({ ...produto, nome: ' ', categoria_id: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrorsFrom(result.error);
      expect(errors.nome).toBe('Informe o nome do produto.');
      expect(errors.categoria_id).toBe('Escolha uma categoria.');
    }
  });
  it('rejects slugs with spaces, accents or capitals', () => {
    for (const slug of ['Cobogó', 'cobogo teste', 'cobogo--x', '-cobogo']) {
      expect(produtoSchema.safeParse({ ...produto, slug }).success).toBe(false);
    }
  });
  it('accepts decimal yield with comma and rejects text', () => {
    expect(produtoSchema.safeParse({ ...produto, rendimento_pecas_m2: '7,5' }).success).toBe(true);
    expect(produtoSchema.safeParse({ ...produto, rendimento_pecas_m2: 'sete' }).success).toBe(
      false,
    );
  });
  it('allows at most 6 extra images', () => {
    const imagens_extras = Array.from({ length: 7 }, (_, i) => `/seed-images/produtos/${i}.webp`);
    expect(produtoSchema.safeParse({ ...produto, imagens_extras }).success).toBe(false);
  });
});

describe('configuracoesSchema', () => {
  const base = {
    nome_empresa: 'Art Terra',
    slogan: '',
    whatsapp: '(24) 99201-1676',
    email: '',
    instagram: 'artterraoficial',
    endereco: '',
    horario_atendimento: '',
    hero_titulo: '',
    hero_subtitulo: '',
    hero_imagem_url: null,
    catalogo_pdf_url: null,
  };
  it('validates the WhatsApp number', () => {
    expect(configuracoesSchema.safeParse(base).success).toBe(true);
    expect(configuracoesSchema.safeParse({ ...base, whatsapp: '99201-1676' }).success).toBe(false);
  });
  it('rejects an Instagram URL (only the profile name is expected)', () => {
    expect(
      configuracoesSchema.safeParse({ ...base, instagram: 'https://instagram.com/x' }).success,
    ).toBe(false);
  });
});

describe('contactSchema', () => {
  const base = {
    nome: 'Maria Silva',
    telefone: '(24) 99999-0000',
    email: '',
    assunto: 'Orçamento',
    mensagem: 'Gostaria de um orçamento de cobogós.',
  };
  it('accepts a valid message without e-mail', () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });
  it('rejects short phone, bad e-mail and unknown subject', () => {
    expect(contactSchema.safeParse({ ...base, telefone: '9999' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, email: 'maria@' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, assunto: 'Spam' }).success).toBe(false);
  });
});
