"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex items-center gap-3">
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <Button variant="ghost">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button>Sign up</Button>
      </SignUpButton>
    </div>
  );
}
