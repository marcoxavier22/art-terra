import { z } from 'zod';
import { CONTACT_SUBJECTS } from '../site';
import { onlyDigits } from '../text';

export const contactSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'Informe seu nome.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
  telefone: z
    .string()
    .trim()
    .refine((v) => [10, 11].includes(onlyDigits(v).length), {
      message: 'Informe um telefone com DDD, ex.: (24) 99999-9999.',
    }),
  email: z
    .string()
    .trim()
    .max(160, 'O e-mail deve ter no máximo 160 caracteres.')
    .refine((v) => v === '' || z.email().safeParse(v).success, {
      message: 'Informe um e-mail válido ou deixe em branco.',
    }),
  assunto: z.enum(CONTACT_SUBJECTS, { message: 'Escolha um assunto.' }),
  mensagem: z
    .string()
    .trim()
    .min(5, 'Escreva sua mensagem (mínimo de 5 caracteres).')
    .max(2000, 'A mensagem deve ter no máximo 2000 caracteres.'),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Server-only extras: honeypot (`website`) and time the form stayed open (`elapsed`, ms). */
export const contactRequestSchema = contactSchema.extend({
  website: z.string().max(200).optional().default(''),
  elapsed: z.number().int().nonnegative().optional(),
});

/** Strips control characters and collapses excessive blank lines. */
export function sanitizeText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
