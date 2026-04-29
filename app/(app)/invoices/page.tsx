import Link from "next/link";
import { db, invoices } from "@/lib/db";
import { and, desc, eq, ilike } from "drizzle-orm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchParams {
  q?: string;
  status?: string;
}

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const q = searchParams.q ?? "";
  const status = searchParams.status;

  const where: Array<ReturnType<typeof eq> | ReturnType<typeof ilike>> = [];
  if (q.length > 0) where.push(ilike(invoices.clientName, `%${q}%`));
  if (status && status !== "ALL") where.push(eq(invoices.status, status as "PAID" | "UNPAID"));

  const rows = await (where.length > 0
    ? db.select().from(invoices).where(and(...where)).orderBy(desc(invoices.createdAt))
    : db.select().from(invoices).orderBy(desc(invoices.createdAt)));

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
                  <TableCell>
                  <Badge variant={inv.status === "PAID" ? "success" : "secondary"}>
                    {inv.status}
                  </Badge>
                </TableCell>
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

