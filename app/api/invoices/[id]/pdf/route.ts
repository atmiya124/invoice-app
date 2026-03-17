import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, invoices, invoiceItems } from "@/lib/db";
import { eq } from "drizzle-orm";
import { InvoicePDF } from "@/lib/pdf/InvoicePDF";
import { renderToBuffer } from "@react-pdf/renderer";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  const userId = (session?.user as any)?.id as number | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id));

  if (!invoice || invoice.createdBy !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoice.id));

  const pdf = (
    <InvoicePDF
      company={{
        name: "Your Company",
        addressLine1: "Street address",
        addressLine2: "City, Country",
        email: "info@example.com"
      }}
      invoice={{
        number: invoice.invoiceNumber,
        issueDate: invoice.issueDate.toISOString().slice(0, 10),
        dueDate: invoice.dueDate.toISOString().slice(0, 10),
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        subtotal: Number(invoice.subtotal),
        tax: Number(invoice.tax),
        total: Number(invoice.total),
        notes: null
      }}
      items={items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        price: Number(it.price),
        total: Number(it.total)
      }))}
    />
  );

  const buffer = await renderToBuffer(pdf);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    }
  });
}

