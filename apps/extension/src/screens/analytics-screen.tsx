"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@flashycardy/ui/table";
import { Badge } from "@flashycardy/ui/badge";
import { Button } from "@flashycardy/ui/button";
import { ArrowLeftIcon, BarChart2Icon } from "lucide-react";
import { fetchAllPages } from "@/lib/fetch-all-pages";
import { useApi } from "@/lib/api-provider";

type StudySessionRow = {
  id: number;
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  completedAt: string;
  deck: { uuid: string; name: string };
};

export function AnalyticsScreen() {
  const api = useApi();
  const t = useTranslations("Analytics");
  const tExt = useTranslations("Extension");
  const tCommon = useTranslations("Common");
  const format = useFormatter();
  const [sessions, setSessions] = useState<StudySessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchAllPages((p) => api.studySessions.list(p));
        if (!cancelled) {
          setSessions(rows as StudySessionRow[]);
        }
      } catch {
        if (!cancelled) setError(tCommon("tryAgain"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, tCommon]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">{tExt("loading")}</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          to="/dashboard"
          className="mb-1 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          {t("backToDashboard")}
        </Link>
        <h1 className="pt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <BarChart2Icon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">{t("emptyTitle")}</p>
            <p className="max-w-xs text-sm text-muted-foreground">{t("emptyDescription")}</p>
          </div>
          <Button variant="secondary" nativeButton={false} render={<Link to="/dashboard" />}>
            {t("goStudy")}
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("colId")}</TableHead>
                <TableHead>{t("colDeck")}</TableHead>
                <TableHead className="text-center">{t("colTotalCards")}</TableHead>
                <TableHead className="text-center">{t("colCorrect")}</TableHead>
                <TableHead className="text-center">{t("colIncorrect")}</TableHead>
                <TableHead className="text-center">{t("colScore")}</TableHead>
                <TableHead>{t("colCompletedAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const score =
                  session.totalCards > 0
                    ? Math.round((session.correctCount / session.totalCards) * 100)
                    : 0;
                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{session.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        to={`/decks/${session.deck.uuid}`}
                        className="hover:underline"
                      >
                        {session.deck.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">{session.totalCards}</TableCell>
                    <TableCell className="text-center font-medium text-green-500">
                      {session.correctCount}
                    </TableCell>
                    <TableCell className="text-center font-medium text-red-400">
                      {session.incorrectCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          score >= 80 ? "default" : score >= 50 ? "secondary" : "destructive"
                        }
                      >
                        {score}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format.dateTime(new Date(session.completedAt), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
