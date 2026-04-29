import React from "react";
import { NextResponse } from "next/server";
import { db, invoices, invoiceItems, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { InvoicePDF } from "@/lib/pdf/InvoicePDF";
import { renderToBuffer } from "@react-pdf/renderer";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Join with users to get company info
  const [invoice] = await db
    .select({
      ...invoices._.columns,
      createdByUser: users
    })
    .from(invoices)
    .where(eq(invoices.id, id))
    .leftJoin(users, eq(invoices.createdBy, users.id));

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoice.id));

  // Only user's name, not company name
  const userName = invoice.createdByUser?.name || "Your Name";
  // Support for two invoice numbers (example: invoice.invoiceNumber2)
  const pdf = (
    <InvoicePDF
      company={{
        name: userName,
        email: invoice.createdByUser?.email
      }}
      invoice={{
        number: invoice.invoiceNumber,
        number2: invoice.invoiceNumber2 || undefined, // optional second number
        issueDate: invoice.issueDate.toISOString().slice(0, 10),
        dueDate: invoice.dueDate.toISOString().slice(0, 10),
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        subtotal: Number(invoice.subtotal),
        tax: Number(invoice.tax),
        total: Number(invoice.total),
        notes: null,
        submittedOn: invoice.submittedOn ? invoice.submittedOn.toISOString().slice(0, 10) : undefined
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

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    }
  });
}
