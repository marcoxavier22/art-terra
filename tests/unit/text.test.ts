import { describe, expect, it } from 'vitest';
import {
  faceLabel,
  floorToTen,
  maskPhoneBR,
  normalizeText,
  slugify,
  toWhatsappDigits,
} from '@/lib/text';

describe('slugify', () => {
  it('removes accents, symbols and extra separators', () => {
    expect(slugify('Cobogó Círculo')).toBe('cobogo-circulo');
    expect(slugify('Pezão / Pé Grande')).toBe('pezao-pe-grande');
    expect(slugify('  Piso   Tátil — Alerta!  ')).toBe('piso-tatil-alerta');
  });
  it('limits the length to 80 characters', () => {
    expect(slugify('a'.repeat(200))).toHaveLength(80);
  });
  it('returns an empty string when nothing usable is left', () => {
    expect(slugify('—/—')).toBe('');
  });
});

describe('normalizeText', () => {
  it('lets "cobogo" match "Cobogó"', () => {
    expect(normalizeText('Cobogó Árabe')).toContain(normalizeText('COBOGO'));
  });
});

describe('floorToTen', () => {
  it('floors the product count for the "+30 modelos" badge', () => {
    expect(floorToTen(35)).toBe(30);
    expect(floorToTen(40)).toBe(40);
    expect(floorToTen(9)).toBe(0);
    expect(floorToTen(-3)).toBe(0);
  });
});

describe('phone helpers', () => {
  it('masks Brazilian mobile and landline numbers', () => {
    expect(maskPhoneBR('24992011676')).toBe('(24) 99201-1676');
    expect(maskPhoneBR('2433334444')).toBe('(24) 3333-4444');
    expect(maskPhoneBR('5524992011676')).toBe('(24) 99201-1676');
    expect(maskPhoneBR('')).toBe('');
  });
  it('stores WhatsApp numbers as digits with country code 55', () => {
    expect(toWhatsappDigits('(24) 99201-1676')).toBe('5524992011676');
    expect(toWhatsappDigits('+55 24 99201-1676')).toBe('5524992011676');
    expect(toWhatsappDigits('99201-1676')).toBeNull();
  });
});

describe('faceLabel', () => {
  it('translates the stored value', () => {
    expect(faceLabel('uma_face')).toBe('Uma face');
    expect(faceLabel('uma_ou_dupla')).toBe('Uma face / Dupla face');
    expect(faceLabel(null)).toBeNull();
  });
});
