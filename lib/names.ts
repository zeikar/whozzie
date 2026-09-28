import { useSyncExternalStore } from "react";

export const MAX_NAMES = 100;
export const MAX_NAME_LENGTH = 40;

/** A spreadsheet row's numbering cell ("1", "2.", "3)"), not a name. */
const ROW_NUMBER = /^\d+[.)]?$/;

/**
 * Splits typed or pasted text into names: one per line or comma. A line with
 * tabs is a spreadsheet row, so it's one name: its cells joined with spaces,
 * minus a numbering column (rosters are often "No." + name). Hangul is composed
 * first, so the length cap counts syllables.
 */
export function parseNames(input: string): string[] {
  return input
    .normalize("NFC")
    .split("\n")
    .flatMap((line) => {
      if (!line.includes("\t")) return line.split(",");
      const cells = line.split("\t").map((cell) => cell.trim()).filter(Boolean);
      const named = cells.filter((cell) => !ROW_NUMBER.test(cell));
      return [(named.length > 0 ? named : cells).join(" ")];
    })
    .map((name) => name.trim().slice(0, MAX_NAME_LENGTH))
    .filter(Boolean);
}

export type MergeResult = {
  names: string[];
  added: string[];
  /** Names already on the list, each reported once. */
  duplicates: string[];
  /** Names dropped because the list hit MAX_NAMES. */
  overflow: string[];
};

/** Appends names, skipping ones already on the list and stopping at MAX_NAMES. */
export function mergeNames(current: readonly string[], incoming: readonly string[]): MergeResult {
  const names = [...current];
  const seen = new Set(current);
  const result: MergeResult = { names, added: [], duplicates: [], overflow: [] };
  for (const raw of incoming) {
    // One name typed on one device and pasted from another (e.g. a macOS file
    // name) can differ in Hangul composition; store one form so they dedupe.
    const name = raw.normalize("NFC");
    if (seen.has(name)) {
      if (!result.duplicates.includes(name)) result.duplicates.push(name);
    } else if (names.length >= MAX_NAMES) result.overflow.push(name);
    else {
      seen.add(name);
      names.push(name);
      result.added.push(name);
    }
  }
  return result;
}

/**
 * Puts a removed name back at `index`, so it gets its old color back. Leaves the
 * list alone if the name has been added again since or the list is full.
 */
export function restoreName(current: readonly string[], name: string, index: number): readonly string[] {
  if (current.includes(name) || current.length >= MAX_NAMES) return current;
  const at = Math.min(index, current.length);
  return [...current.slice(0, at), name, ...current.slice(at)];
}

// ---------------------------------------------------------------------------
// Shared store: every picker reads the same list, persisted across visits and
// kept in sync between tabs.

const STORAGE_KEY = "whozzie:names";
const EMPTY: readonly string[] = [];

/** A single name taken off the list, and where it was. */
export type Removal = { name: string; index: number };

let names: readonly string[] = EMPTY;
let hydrated = false;
// Only the latest removal can be undone.
let lastRemoval: Removal | null = null;
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

/** The latest removal (from a chip or a result dialog), for NamesCard to offer an undo. */
export function useLastRemoval(): Removal | null {
  return useSyncExternalStore(
    subscribe,
    () => lastRemoval,
    () => null,
  );
}

export function addNames(input: string): MergeResult {
  const result = mergeNames(names, parseNames(input));
  if (result.added.length > 0) commit(result.names);
  return result;
}

export function removeName(name: string) {
  const index = names.indexOf(name);
  if (index < 0) return;
  lastRemoval = { name, index };
  commit(names.filter((item) => item !== name));
}

/** Undoes `removal` if it's still the latest one. */
export function undoRemoval(removal: Removal) {
  if (removal !== lastRemoval) return;
  lastRemoval = null;
  commit(restoreName(names, removal.name, removal.index));
}

export function clearNames() {
  lastRemoval = null;
  commit(EMPTY);
}
