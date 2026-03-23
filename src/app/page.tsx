import { SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Flashycardy</h1>
        <p className="text-lg text-muted-foreground">
          Your personal flashcard platform
        </p>
      </div>
      <Show when="signed-out">
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button>Sign up</Button>
          </SignUpButton>
        </div>
      </Show>
    </main>
  );
}
