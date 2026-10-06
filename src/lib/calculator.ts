export interface PieceEstimate {
  base: number;
  total: number;
}

/**
 * Estimates how many pieces are needed for an area.
 * `piecesPerM2` comes from the product; `lossPercent` is the suggested breakage margin.
 */
export function estimatePieces(
  areaM2: number,
  piecesPerM2: number,
  lossPercent = 10,
): PieceEstimate | null {
  if (!Number.isFinite(areaM2) || !Number.isFinite(piecesPerM2)) return null;
  if (areaM2 <= 0 || piecesPerM2 <= 0) return null;
  const loss = Number.isFinite(lossPercent) ? Math.min(Math.max(lossPercent, 0), 100) : 0;
  const raw = areaM2 * piecesPerM2;
  // tiny epsilon avoids 7.000000001 -> 8 from floating point noise
  const base = Math.ceil(raw - 1e-9);
  const total = Math.ceil(raw * (1 + loss / 100) - 1e-9);
  return { base, total };
}
