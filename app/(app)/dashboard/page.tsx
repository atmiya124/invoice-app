import { db, invoices } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const rows = await db
    .select()
    .from(invoices)
    .orderBy(desc(invoices.createdAt))
    .limit(100);

  const total = rows.length;
  const paid = rows.filter((r) => r.status === "PAID").length;
  const unpaid = rows.filter((r) => r.status === "UNPAID").length;
  const recent = rows.slice(0, 5).map((row) => ({
    id: row.id,
    clientName: row.clientName,
    status: row.status,
    total: row.total.toString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your invoices
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{paid}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unpaid}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent invoices</CardTitle>
          <p className="text-sm text-muted-foreground">Latest 5 invoices</p>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No invoices yet. Create your first invoice to get started.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="font-medium">{inv.clientName}</span>
                  <span className="text-muted-foreground text-sm">
                    {inv.status} · ${inv.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
