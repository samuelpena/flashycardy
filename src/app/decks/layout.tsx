import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DecksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-3">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            FlashyCardy
          </Link>
          <UserButton />
        </div>
      </header>
      {children}
    </>
  );
}
