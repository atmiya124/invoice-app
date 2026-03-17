import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.number().optional(),
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative()
});

export const invoiceSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional().or(z.literal("")),
  status: z.enum(["PAID", "UNPAID"]).default("UNPAID"),
  issueDate: z.string(),
  dueDate: z.string(),
  items: z.array(invoiceItemSchema).min(1),
  notes: z.string().optional()
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

