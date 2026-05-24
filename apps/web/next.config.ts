import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@flashycardy/ui",
    "@flashycardy/i18n",
    "@flashycardy/api-client",
    "@flashycardy/features",
  ],
  /** Keep pdf/office parsers on Node resolution (pdfjs workers, dynamic imports). */
  serverExternalPackages: ["officeparser", "pdfjs-dist", "pdf-parse"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default withNextIntl(nextConfig);
