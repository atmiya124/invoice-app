import { auth } from "@/auth";
import { db, invoices } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as number | undefined;

  let total = 0;
  let paid = 0;
  let unpaid = 0;
  let recent: { id: number; clientName: string; status: string; total: string }[] =
    [];

  if (userId) {
    const rows = await db
      .select()
      .from(invoices)
      .where(eq(invoices.createdBy, userId))
      .orderBy(desc(invoices.createdAt))
      .limit(5);

    rows.forEach((row) => {
      total += 1;
      if (row.status === "PAID") paid += 1;
      else unpaid += 1;
      recent.push({
        id: row.id,
        clientName: row.clientName,
        status: row.status,
        total: row.total.toString()
      });
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{paid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{unpaid}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No invoices yet.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {recent.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between">
                  <span>{inv.clientName}</span>
                  <span className="text-muted-foreground">
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


