export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const GENERIC_ERROR = 'Não foi possível concluir. Tente novamente em instantes.';
