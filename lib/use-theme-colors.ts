import { useSyncExternalStore } from "react";
import { MARKER_COUNT } from "./markers";

export type ThemeColors = {
  card: string;
  ink: string;
  onMarker: string;
  /** --marker-0…7; index with markerIndex(). */
  markers: string[];
};

let cache: { key: string; colors: ThemeColors } | null = null;

function read(): ThemeColors {
  const style = getComputedStyle(document.documentElement);
  const value = (name: string) => style.getPropertyValue(name).trim();
  return {
    card: value("--card"),
    ink: value("--ink"),
    onMarker: value("--on-marker"),
    markers: Array.from({ length: MARKER_COUNT }, (_, i) => value(`--marker-${i}`)),
  };
}

// The theme is a class on <html>; re-read the palette whenever it changes.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot(): ThemeColors {
  const key = document.documentElement.className;
  if (cache?.key !== key) cache = { key, colors: read() };
  return cache.colors;
}

/**
 * The theme's colors as plain strings, for canvas/WebGL drawing that can't use
 * CSS variables. Null during server rendering.
 */
export function useThemeColors(): ThemeColors | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
