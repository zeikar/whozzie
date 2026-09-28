import { notFound } from "next/navigation";

// Sends unknown paths under a locale to app/[locale]/not-found.tsx, inside the site chrome.
export default function CatchAll() {
  notFound();
}
