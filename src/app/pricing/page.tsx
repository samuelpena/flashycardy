import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your plan</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Unlock the full potential of your flashcard learning experience with our flexible pricing plans.
        </p>
      </div>
      <PricingTable />
    </main>
  );
}
