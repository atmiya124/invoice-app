import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";

export interface InvoicePdfItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoicePdfProps {
  company: {
    name: string; // This will be user's name only, not company name
    addressLine1?: string;
    addressLine2?: string;
    email?: string;
  };
  invoice: {
    number: string;
    number2?: string; // Optional second invoice number for company profile
    issueDate: string;
    dueDate: string;
    clientName: string;
    clientEmail?: string | null;
    subtotal: number;
    tax: number;
    total: number;
    notes?: string | null;
    submittedOn?: string; // For right-aligned submitted date
  };
  items: InvoicePdfItem[];
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  heading: {
    fontSize: 20,
    marginBottom: 8
  },
  label: {
    fontSize: 9,
    color: "#666"
  },
  value: {
    fontSize: 10
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    marginTop: 16
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    paddingVertical: 4
  },
  footer: {
    marginTop: 24,
    fontSize: 9,
    color: "#666"
  }
});

export function InvoicePDF({ company, invoice, items }: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View>
            {/* Only user's name, not company name */}
            <Text style={styles.heading}>{company.name}</Text>
            {company.addressLine1 && <Text>{company.addressLine1}</Text>}
            {company.addressLine2 && <Text>{company.addressLine2}</Text>}
            {company.email && <Text>{company.email}</Text>}
          </View>
          <View style={{ alignItems: "flex-end", minWidth: 180 }}>
            {/* Right-aligned Invoice number(s) and Submitted on date */}
            <Text style={{ fontSize: 18 }}>INVOICE</Text>
            <Text style={styles.label}>Invoice #</Text>
            <Text style={styles.value}>{invoice.number}</Text>
            {invoice.number2 && (
              <>
                <Text style={styles.label}>Alt Invoice #</Text>
                <Text style={styles.value}>{invoice.number2}</Text>
              </>
            )}
            <Text style={[styles.label, { marginTop: 4 }]}>Issue date</Text>
            <Text style={styles.value}>{invoice.issueDate}</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>Due date</Text>
            <Text style={styles.value}>{invoice.dueDate}</Text>
            {invoice.submittedOn && (
              <>
                <Text style={[styles.label, { marginTop: 4 }]}>Submitted on</Text>
                <Text style={styles.value}>{invoice.submittedOn}</Text>
              </>
            )}
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.label}>Bill to</Text>
          {/* Make Bill To address text color same as other text (not blue) */}
          <Text style={styles.value}>{invoice.clientName}</Text>
          {invoice.clientEmail && <Text style={styles.value}>{invoice.clientEmail}</Text>}
        </View>

        <View style={styles.tableHeader}>
          <Text style={{ flex: 3 }}>Description</Text>
          <Text style={{ flex: 1, textAlign: "right" }}>Qty</Text>
          <Text style={{ flex: 1, textAlign: "right" }}>Price</Text>
          <Text style={{ flex: 1, textAlign: "right" }}>Total</Text>
        </View>

        {items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={{ flex: 3 }}>{item.description}</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>{item.quantity}</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>
              ${item.price.toFixed(2)}
            </Text>
            <Text style={{ flex: 1, textAlign: "right" }}>
              ${item.total.toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={{ marginTop: 16, marginLeft: "auto", width: 200 }}>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>${invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax</Text>
            <Text style={styles.value}>${invoice.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.value, { marginTop: 4 }]}>Total</Text>
            <Text style={[styles.value, { marginTop: 4 }]}>
              ${invoice.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Thank you for your business. This layout is intentionally structured
          so you can easily adjust spacing, typography, and sections to match
          your Figma design.
        </Text>
      </Page>
    </Document>
  );
}

