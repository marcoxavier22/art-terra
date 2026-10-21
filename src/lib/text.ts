/** Lowercases and strips diacritics so "Cobogó" matches "cobogo". */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** URL-safe slug: "Pezão / Pé Grande" -> "pezao-pe-grande". */
export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Floors to the nearest ten: 35 -> 30. Used for the "+30 modelos" badge. */
export function floorToTen(n: number): number {
  return Math.floor(Math.max(0, n) / 10) * 10;
}

export function pluralize(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Brazilian phone mask: (24) 99201-1676 / (24) 3333-4444 */
export function maskPhoneBR(value: string): string {
  let d = onlyDigits(value);
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Stores phone as digits with country code 55. Returns null when invalid. */
export function toWhatsappDigits(value: string): string | null {
  let d = onlyDigits(value);
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  return `55${d}`;
}

/** 5524992011676 -> (24) 99201-1676 */
export function formatWhatsappDisplay(digits: string): string {
  return maskPhoneBR(digits);
}

const FACE_LABELS: Record<string, string> = {
  uma_face: 'Uma face',
  dupla_face: 'Dupla face',
  uma_ou_dupla: 'Uma face / Dupla face',
};

export function faceLabel(face: string | null | undefined): string | null {
  if (!face) return null;
  return FACE_LABELS[face] ?? null;
}
