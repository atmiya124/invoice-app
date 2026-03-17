import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, invoices, invoiceItems } from "@/lib/db";
import { invoiceSchema } from "@/lib/validations/invoice";
import { and, desc, eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id as number | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(invoices)
    .where(eq(invoices.createdBy, userId))
    .orderBy(desc(invoices.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id as number | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      status: data.status,
      issueDate,
      dueDate,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      createdBy: userId
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

