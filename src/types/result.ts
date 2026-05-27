/**
 * Result<T, E> — discriminated union returned by every mutating action across
 * the Propeller UI package suite. Reads (fetch/get) throw; writes
 * (create/update/delete/add) return Result so consumers must explicitly
 * handle the failure case.
 */
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/**
 * Convert a thrown promise into a Result. Useful for wrapping reads that you
 * don't want to throw at a call site.
 */
export async function tryAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(e instanceof Error ? e.message : String(e));
  }
}
