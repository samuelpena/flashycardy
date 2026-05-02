import { PricingTable } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";
import { BackButton } from "@/components/back-button";

export default async function PricingPage() {
  const t = await getTranslations("Pricing");

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="self-start">
        <BackButton />
      </div>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-muted-foreground max-w-md">{t("subtitle")}</p>
      </div>
      <PricingTable />
    </main>
  );
}
