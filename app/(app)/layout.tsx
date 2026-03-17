import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-60 flex-col border-r bg-card">
        <div className="px-4 py-4 text-lg font-semibold tracking-tight">
          Invoice Manager
        </div>
        <nav className="flex-1 px-2 space-y-1 text-sm">
          <Link
            href="/dashboard"
            className="flex items-center rounded-md px-3 py-2 hover:bg-accent"
          >
            Dashboard
          </Link>
          <Link
            href="/invoices"
            className="flex items-center rounded-md px-3 py-2 hover:bg-accent"
          >
            Invoices
          </Link>
          <Link
            href="/create"
            className="flex items-center rounded-md px-3 py-2 hover:bg-accent"
          >
            Create Invoice
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="md:hidden text-base font-semibold">Invoice Manager</div>
          <div className="flex items-center gap-3 text-sm">
            {session?.user && (
              <>
                <span className="text-muted-foreground">
                  {session.user.name ?? session.user.email}
                </span>
                <form action="/api/auth/signout" method="post">
                  <Button type="submit" size="sm" variant="outline">
                    Sign out
                  </Button>
                </form>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

