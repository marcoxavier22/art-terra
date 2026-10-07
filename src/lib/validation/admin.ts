import { z } from 'zod';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label}: máximo de ${max} caracteres.`);

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Informe o endereço (slug).')
  .max(80, 'Máximo de 80 caracteres.')
  .regex(SLUG_RE, 'Use apenas letras minúsculas, números e hífens (ex.: cobogo-circulo).');

export const hexSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Informe a cor no formato #RRGGBB.');

export const medidaSchema = z.object({
  rotulo: z.string().trim().max(40, 'Rótulo: máximo de 40 caracteres.'),
  valor: z
    .string()
    .trim()
    .min(1, 'Informe a medida ou remova esta linha.')
    .max(60, 'Medida: máximo de 60 caracteres.'),
});

export const FACE_OPTIONS = [
  { value: '', label: 'Não se aplica' },
  { value: 'uma_face', label: 'Uma face' },
  { value: 'dupla_face', label: 'Dupla face' },
  { value: 'uma_ou_dupla', label: 'Uma ou dupla' },
] as const;

export const MAX_EXTRA_IMAGES = 6;

export const produtoSchema = z.object({
  categoria_id: z.string().uuid('Escolha uma categoria.'),
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome do produto.')
    .max(120, 'Máximo de 120 caracteres.'),
  slug: slugSchema,
  descricao: optionalText(2000, 'Descrição'),
  medidas: z.array(medidaSchema).max(30, 'Máximo de 30 medidas.'),
  rendimento: optionalText(80, 'Rendimento'),
  rendimento_pecas_m2: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || (/^\d{1,4}([.,]\d{1,2})?$/.test(v) && Number(v.replace(',', '.')) > 0),
      {
        message: 'Use apenas números, ex.: 7 ou 7,5.',
      },
    ),
  face: z.enum(['', 'uma_face', 'dupla_face', 'uma_ou_dupla']),
  observacao_face: optionalText(120, 'Observação'),
  aplicacao: optionalText(300, 'Aplicação'),
  observacoes: optionalText(1000, 'Observações'),
  cores: z.array(z.string().uuid()).max(40),
  imagem_principal_url: z.string().max(600).nullable(),
  imagem_aplicacao_url: z.string().max(600).nullable(),
  imagens_extras: z
    .array(z.string().max(600))
    .max(MAX_EXTRA_IMAGES, `Máximo de ${MAX_EXTRA_IMAGES} imagens extras.`),
  ativo: z.boolean(),
  destaque: z.boolean(),
});
export type ProdutoInput = z.infer<typeof produtoSchema>;

export const categoriaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, 'Informe o nome da categoria.')
    .max(80, 'Máximo de 80 caracteres.'),
  slug: slugSchema,
  descricao: optionalText(600, 'Descrição'),
  imagem_capa_url: z.string().max(600).nullable(),
  ativo: z.boolean(),
});
export type CategoriaInput = z.infer<typeof categoriaSchema>;

export const corSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da cor.').max(40, 'Máximo de 40 caracteres.'),
  hex: hexSchema,
});
export type CorInput = z.infer<typeof corSchema>;

export const galeriaItemSchema = z.object({
  imagem_url: z.string().min(1).max(600),
  legenda: optionalText(120, 'Legenda'),
  alt: z
    .string()
    .trim()
    .min(5, 'Descreva a foto em poucas palavras (mínimo de 5 caracteres).')
    .max(200, 'Máximo de 200 caracteres.'),
  ativo: z.boolean(),
});
export type GaleriaItemInput = z.infer<typeof galeriaItemSchema>;

export const configuracoesSchema = z.object({
  nome_empresa: z.string().trim().min(1, 'Informe o nome da empresa.').max(80),
  slogan: optionalText(120, 'Slogan'),
  whatsapp: z
    .string()
    .trim()
    .refine(
      (v) => [10, 11].includes(v.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').length),
      {
        message: 'Informe o WhatsApp com DDD, ex.: (24) 99229-0708.',
      },
    ),
  email: z
    .string()
    .trim()
    .max(160)
    .refine((v) => v === '' || z.email().safeParse(v).success, { message: 'E-mail inválido.' }),
  instagram: z
    .string()
    .trim()
    .max(60)
    .regex(/^@?[A-Za-z0-9._]*$/, 'Informe só o nome do perfil, ex.: artterraoficial.'),
  endereco: optionalText(240, 'Endereço'),
  horario_atendimento: optionalText(240, 'Horário'),
  hero_titulo: optionalText(90, 'Título'),
  hero_subtitulo: optionalText(320, 'Subtítulo'),
  hero_imagem_url: z.string().max(600).nullable(),
  catalogo_pdf_url: z.string().max(600).nullable(),
});
export type ConfiguracoesInput = z.infer<typeof configuracoesSchema>;

/** Flattens zod issues into { "campo": "mensagem", "medidas.0.valor": "…" }. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    out[key] ??= issue.message;
  }
  return out;
}
