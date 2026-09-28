import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything but Next's own files, Vercel's, API routes, and paths with a dot
  // (files such as favicon.ico).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
