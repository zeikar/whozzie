import { useCallback, useSyncExternalStore } from "react";

/**
 * A picker setting remembered across visits in localStorage (e.g. the dice mode).
 * Each tab reads it once and keeps its own copy after that, so a game in progress
 * never changes under the player because another tab changed a setting.
 */

const values = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

/** A saved JSON string back as a value, or undefined when it's missing, corrupt or fails `parse`. */
export function parsePersisted<T>(saved: string | null, parse: (value: unknown) => T | undefined): T | undefined {
  if (saved === null) return undefined;
  try {
    return parse(JSON.parse(saved));
  } catch (error) {
    console.warn("whozzie: ignoring a corrupt saved setting", error);
    return undefined;
  }
}

function load<T>(key: string, fallback: T, parse: (value: unknown) => T | undefined): T {
  if (!values.has(key)) {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(key);
    } catch (error) {
      // Blocked storage: use the default for this visit.
      console.warn("whozzie: could not read a saved setting", error);
    }
    values.set(key, parsePersisted(saved, parse) ?? fallback);
  }
  return values.get(key) as T;
}

function save(key: string, value: unknown) {
  values.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Private mode or a full quota: the setting still holds for this visit.
    console.warn("whozzie: could not save a setting", error);
  }
  listeners.get(key)?.forEach((listener) => listener());
}

/**
 * Like useState, but remembered under `key` (use "whozzie:<picker>:<setting>").
 * `parse` gets the saved JSON value as `unknown` and returns it as a T, or
 * undefined if it isn't a valid one (then `fallback` is used). Pass a `fallback`
 * that is a constant, not a new object each render. The server and the first
 * client render use `fallback`; the saved value follows right after hydration.
 */
export function usePersistedState<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T | undefined,
): readonly [T, (next: T) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const set = listeners.get(key) ?? new Set();
      listeners.set(key, set);
      set.add(onChange);
      return () => set.delete(onChange);
    },
    [key],
  );
  const value = useSyncExternalStore(
    subscribe,
    () => load(key, fallback, parse),
    () => fallback,
  );
  const setValue = useCallback((next: T) => save(key, next), [key]);
  return [value, setValue];
}
