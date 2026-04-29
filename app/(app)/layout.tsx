import { ReactNode } from "react";
import { Receipt } from "lucide-react";
import { AppNav } from "@/components/app-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Receipt className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            Invoice Manager
          </span>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <AppNav />
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="md:hidden flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span className="font-semibold">Invoice Manager</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
