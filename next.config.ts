import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Keep pdf/office parsers on Node resolution (pdfjs workers, dynamic imports). */
  serverExternalPackages: ["officeparser", "pdfjs-dist", "pdf-parse"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
