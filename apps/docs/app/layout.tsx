import type { Metadata } from "next";
import { Footer, Layout, Link, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata: Metadata = {
  title: {
    default: "Flashycardy Docs",
    template: "%s — Flashycardy Docs",
  },
  description:
    "Product guide for Flashycardy users and developer documentation for contributors and API integrators.",
};

const navbar = (
  <Navbar logo={<b>Flashycardy</b>} logoLink="/">
    <Link href="/users/introduction" className="x:mr-4 x:max-md:hidden">
      Product Guide
    </Link>
    <Link href="/developers/introduction" className="x:mr-4 x:max-md:hidden">
      Developer Guide
    </Link>
    <Link href="/api/overview" className="x:max-md:hidden">
      API
    </Link>
  </Navbar>
);

const footer = <Footer>{`© ${new Date().getFullYear()} Flashycardy.`}</Footer>;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/flashycardy/flashycardy/tree/main/apps/docs"
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
