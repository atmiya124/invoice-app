"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvoiceInput } from "@/lib/validations/invoice";

type Item = {
  description: string;
  quantity: number;
  price: number;
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, price: 0 }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  async function onSubmit() {
    setSubmitting(true);
    const payload: InvoiceInput = {
      clientName,
      clientEmail,
      status: "UNPAID",
      issueDate,
      dueDate,
      items: items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        price: it.price
      })),
      notes: ""
    };
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/invoices");
    } else {
      console.error("Failed to create invoice");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Create invoice</h1>
      <Card>
        <CardHeader>
          <CardTitle>Invoice details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 text-sm">
              <label className="font-medium">Client name</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">Client email</label>
              <Input
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">Issue date</label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1 text-sm">
              <label className="font-medium">Due date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Items</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    { description: "", quantity: 1, price: 0 }
                  ])
                }
              >
                Add item
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid gap-2 md:grid-cols-[2fr,1fr,1fr,auto]"
                >
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, description: e.target.value } : it
                        )
                      )
                    }
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === idx
                            ? { ...it, quantity: Number(e.target.value) || 0 }
                            : it
                        )
                      )
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === idx
                            ? { ...it, price: Number(e.target.value) || 0 }
                            : it
                        )
                      )
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="button" onClick={onSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Save invoice"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

