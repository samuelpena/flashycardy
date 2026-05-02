import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthButtons } from "@/components/auth-buttons";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  const t = await getTranslations("HomePage");
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-bold tracking-tight">{t("heading")}</h1>
        <p className="text-lg text-muted-foreground">{t("tagline")}</p>
      </div>
      <AuthButtons />
    </main>
  );
}
