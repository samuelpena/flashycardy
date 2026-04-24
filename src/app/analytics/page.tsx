import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAllStudySessionsByUser } from "@/db/queries/study-sessions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, BarChart2Icon } from "lucide-react";
import Link from "next/link";

/**
 * Renders the analytics page showing all study sessions for the current user.
 *
 * Redirects unauthenticated users to `/`. Displays an empty-state prompt when
 * no sessions exist, otherwise renders a sortable table with per-session scores
 * colour-coded by a badge (≥80% default, ≥50% secondary, <50% destructive).
 *
 * @returns The analytics page UI as a React Server Component
 */
export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const sessions = await getAllStudySessionsByUser(userId);

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-1"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to dashboard
        </Link>
        <div className="flex flex-col gap-1 pt-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Analytics
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            A record of all your study sessions.
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <BarChart2Icon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">No sessions yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Complete a study session to start tracking your progress here.
            </p>
          </div>
          <Button variant="secondary" nativeButton={false} render={<Link href="/dashboard" />}>
            Go study a deck
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Deck</TableHead>
                <TableHead className="text-center">Total Cards</TableHead>
                <TableHead className="text-center">Correct</TableHead>
                <TableHead className="text-center">Incorrect</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead>Completed At</TableHead>
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
                        href={`/decks/${session.deck.uuid}`}
                        className="hover:underline"
                      >
                        {session.deck.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">{session.totalCards}</TableCell>
                    <TableCell className="text-center text-green-500 font-medium">
                      {session.correctCount}
                    </TableCell>
                    <TableCell className="text-center text-red-400 font-medium">
                      {session.incorrectCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          score >= 80
                            ? "default"
                            : score >= 50
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {score}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(session.completedAt))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
