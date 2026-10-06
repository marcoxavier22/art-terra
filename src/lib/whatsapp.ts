import { onlyDigits } from './text';

export const DEFAULT_QUOTE_MESSAGE =
  'Olá! Vim pelo site da Art Terra e gostaria de solicitar um orçamento.';

export function whatsappUrl(number: string, message?: string): string {
  const digits = onlyDigits(number);
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function productMessage(
  nome: string,
  options: { cor?: string | null; medida?: string | null } = {},
): string {
  const details = [
    options.medida ? `medida ${options.medida}` : null,
    options.cor ? `cor ${options.cor}` : null,
  ].filter(Boolean);
  const suffix = details.length ? ` (${details.join(', ')})` : '';
  return `Olá! Tenho interesse no produto ${nome}${suffix}. Poderia me passar um orçamento?`;
}

export function contactMessage(input: {
  nome: string;
  telefone: string;
  email?: string | null;
  assunto?: string | null;
  mensagem: string;
}): string {
  const lines = [
    `Olá! Meu nome é ${input.nome}.`,
    input.assunto ? `Assunto: ${input.assunto}` : null,
    input.mensagem,
    `Meu telefone: ${input.telefone}`,
    input.email ? `E-mail: ${input.email}` : null,
  ];
  return lines.filter(Boolean).join('\n');
}
