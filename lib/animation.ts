/**
 * For `animation.finished.catch(ignoreAbort)`: cancelling an animation (a new
 * round, or the page unmounting) rejects `finished` with an AbortError, which
 * isn't a failure. Anything else still throws.
 */
export function ignoreAbort(error: unknown) {
  if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
}
