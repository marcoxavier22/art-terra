'use client';
import { toast } from 'sonner';
import type { ActionResult } from './result';

/** Awaits a Server Action and shows the outcome as a toast (in Portuguese). */
export async function withToast<T>(promise: Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  let result: ActionResult<T>;
  try {
    result = await promise;
  } catch {
    result = {
      ok: false,
      error: 'Sem conexão com o servidor. Verifique a internet e tente de novo.',
    };
  }
  if (result.ok) {
    if (result.message) toast.success(result.message);
  } else {
    toast.error(result.error);
  }
  return result;
}
