import Link from "next/link";
import { auth } from "@/auth";
import { db, invoices } from "@/lib/db";
import { and, desc, eq, ilike } from "drizzle-orm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface SearchParams {
  q?: string;
  status?: string;
}

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const userId = (session?.user as any)?.id as number | undefined;
  if (!userId) return null;

  const q = searchParams.q ?? "";
  const status = searchParams.status;

  const where = [
    eq(invoices.createdBy, userId),
    q ? ilike(invoices.clientName, `%${q}%`) : undefined,
    status && status !== "ALL" ? eq(invoices.status, status as any) : undefined
  ].filter(Boolean) as any[];

  const rows = await db
    .select()
    .from(invoices)
    .where(where.length ? (and as any)(...where) : eq(invoices.createdBy, userId))
    .orderBy(desc(invoices.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <Link href="/create">
          <Button size="sm">Create invoice</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No invoices yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.clientName}</TableCell>
                  <TableCell>{inv.status}</TableCell>
                  <TableCell className="text-right">${inv.total.toString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

