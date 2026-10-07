import 'server-only';
import { NotAuthorizedError } from './auth';
import { GENERIC_ERROR, type ActionResult } from './result';

/** Runs a Server Action body, turning unexpected failures into a friendly message. */
export async function run<T>(scope: string, fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof NotAuthorizedError) return { ok: false, error: error.message };
    console.error(`[admin:${scope}] ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const uuidList = (value: unknown): string[] | null =>
  Array.isArray(value) && value.length > 0 && value.length <= 500 && value.every(isUuid)
    ? (value as string[])
    : null;
