import { NextResponse } from "next/server";
import { db, invoices, invoiceItems } from "@/lib/db";
import { invoiceSchema } from "@/lib/validations/invoice";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(invoices)
    .orderBy(desc(invoices.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {

  const json = await req.json();
  const parse = invoiceSchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }
  const data = parse.data;

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const tax = subtotal * 0.0;
  const total = subtotal + tax;

  const issueDate = new Date(data.issueDate);
  const dueDate = new Date(data.dueDate);

  const [created] = await db
    .insert(invoices)
    .values({
      invoiceNumber: `INV-${Date.now()}`,
      invoiceNumber2: data.invoiceNumber2 || null, // optional second invoice number
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      status: data.status,
      issueDate,
      dueDate,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      submittedOn: data.submittedOn ? new Date(data.submittedOn) : null,
      createdBy: 1
    })
    .returning();

  await db.insert(invoiceItems).values(
    data.items.map((item) => ({
      invoiceId: created.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price.toFixed(2),
      total: (item.quantity * item.price).toFixed(2)
    }))
  );

  return NextResponse.json(created, { status: 201 });
}

