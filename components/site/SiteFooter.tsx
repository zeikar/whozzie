import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto pt-20 pb-8 text-sm text-ink-faint">
      © {new Date().getFullYear()} {SITE_NAME}
    </footer>
  );
}
