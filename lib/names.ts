import { useSyncExternalStore } from "react";

export const MAX_NAMES = 100;
export const MAX_NAME_LENGTH = 40;

/** Splits typed or pasted text into names: one per line, comma, or tab. */
export function parseNames(input: string): string[] {
  return input
    .split(/[\n,\t]/)
    .map((name) => name.trim().slice(0, MAX_NAME_LENGTH))
    .filter(Boolean);
}

export type MergeResult = {
  names: string[];
  added: string[];
  duplicates: string[];
  /** Names dropped because the list hit MAX_NAMES. */
  overflow: string[];
};

/** Appends names, skipping ones already on the list and stopping at MAX_NAMES. */
export function mergeNames(current: readonly string[], incoming: readonly string[]): MergeResult {
  const names = [...current];
  const seen = new Set(current);
  const result: MergeResult = { names, added: [], duplicates: [], overflow: [] };
  for (const name of incoming) {
    if (seen.has(name)) result.duplicates.push(name);
    else if (names.length >= MAX_NAMES) result.overflow.push(name);
    else {
      seen.add(name);
      names.push(name);
      result.added.push(name);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Shared store: every picker reads the same list, persisted across visits and
// kept in sync between tabs.

const STORAGE_KEY = "whozzie:names";
const EMPTY: readonly string[] = [];

let names: readonly string[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function readStorage(): readonly string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return EMPTY;
    return mergeNames([], parsed.filter((item) => typeof item === "string")).names;
  } catch (error) {
    // Blocked storage or a corrupt value: start empty rather than break the page.
    console.warn("whozzie: could not read saved names", error);
    return EMPTY;
  }
}

function commit(next: readonly string[]) {
  names = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    // Private mode or a full quota: the list still works for this visit.
    console.warn("whozzie: could not save names", error);
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  names = readStorage();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    hydrated = true;
    names = readStorage();
  }
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useNames(): readonly string[] {
  return useSyncExternalStore(
    subscribe,
    () => names,
    () => EMPTY,
  );
}

export function addNames(input: string): MergeResult {
  const result = mergeNames(names, parseNames(input));
  if (result.added.length > 0) commit(result.names);
  return result;
}

export function removeName(name: string) {
  commit(names.filter((item) => item !== name));
}

export function clearNames() {
  commit(EMPTY);
}
