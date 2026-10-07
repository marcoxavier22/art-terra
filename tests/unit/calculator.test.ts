import { describe, expect, it } from 'vitest';
import { estimatePieces } from '@/lib/calculator';

describe('estimatePieces', () => {
  it('rounds up and adds the 10% suggested loss', () => {
    // 10 m² of Cobogó 39x39 (7 pç/m²) = 70 pieces, 77 with loss
    expect(estimatePieces(10, 7)).toEqual({ base: 70, total: 77 });
    // 12.5 m² of Piso Calçada (9 pç/m²) = 112.5 -> 113, with loss 123.75 -> 124
    expect(estimatePieces(12.5, 9)).toEqual({ base: 113, total: 124 });
  });
  it('accepts fractional yields (Piso Grama = 7.5)', () => {
    expect(estimatePieces(4, 7.5, 0)).toEqual({ base: 30, total: 30 });
  });
  it('does not round 7.0000001 up because of floating point noise', () => {
    expect(estimatePieces(0.1, 70, 0)).toEqual({ base: 7, total: 7 });
  });
  it('clamps the loss between 0 and 100%', () => {
    expect(estimatePieces(1, 10, -50)).toEqual({ base: 10, total: 10 });
    expect(estimatePieces(1, 10, 500)).toEqual({ base: 10, total: 20 });
  });
  it('returns null for invalid input', () => {
    expect(estimatePieces(0, 7)).toBeNull();
    expect(estimatePieces(-2, 7)).toBeNull();
    expect(estimatePieces(Number.NaN, 7)).toBeNull();
    expect(estimatePieces(10, 0)).toBeNull();
  });
});
