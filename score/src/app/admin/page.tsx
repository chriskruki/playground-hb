import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ADMIN_COOKIE, cookieIsValid, expectedAdminToken } from "@/lib/admin-auth";
import { holes } from "@/lib/holes";
import { ParForm } from "./par-form";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const authed = cookieIsValid(cookieStore.get(ADMIN_COOKIE)?.value);
  const { error } = await searchParams;

  if (!authed) {
    const message =
      expectedAdminToken() === null
        ? "Admin password isn't set. Add ADMIN_PASSWORD to the environment."
        : error === "invalid"
          ? "Incorrect password."
          : null;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
              <Lock className="size-6 text-muted-foreground" />
            </div>
            <CardTitle>Admin access</CardTitle>
            <CardDescription>Enter the admin password to configure par values.</CardDescription>
          </CardHeader>
          <form action="/api/admin/login" method="post">
            <CardContent className="space-y-4">
              <Input type="password" name="password" placeholder="Password" autoFocus required />
              {message && <p className="text-sm text-destructive">{message}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Unlock
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Par configuration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set par for each hole. Changes apply on the next game.
          </p>
        </div>

        <ParForm holes={holes.map((h) => ({ number: h.number, name: h.name, par: h.par }))} />

        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to game
          </Link>
          <form action="/api/admin/login" method="post">
            <input type="hidden" name="logout" value="1" />
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
