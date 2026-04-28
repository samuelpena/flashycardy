import { AppUserButton } from "@/components/app-user-button";

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-lg font-semibold tracking-tight">
            FlashyCardy
          </span>
          <AppUserButton />
        </div>
      </header>
      {children}
    </>
  );
}
