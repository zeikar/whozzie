import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // app/global-not-found.tsx: the root layout sits under [locale], so unknown URLs need their own page.
  experimental: { globalNotFound: true },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
