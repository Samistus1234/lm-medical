function getConfig() {
  return {
    phoneId: process.env.WHATSAPP_PHONE_ID || "",
    token: process.env.WHATSAPP_API_TOKEN || "",
    teamNumber: process.env.WHATSAPP_TEAM_NUMBER || "",
  };
}

async function sendWhatsAppAPI(to: string, payload: Record<string, unknown>): Promise<boolean> {
  const { phoneId, token } = getConfig();
  if (!token || !phoneId) {
    console.log("[WhatsApp] No API credentials — skipped. PHONE_ID:", phoneId ? "set" : "missing", "TOKEN:", token ? "set" : "missing");
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          ...payload,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("[WhatsApp] API error:", JSON.stringify(err));
      return false;
    }

    console.log("[WhatsApp] Message sent to", to);
    return true;
  } catch (err) {
    console.error("[WhatsApp] Send failed:", err);
    return false;
  }
}

// Notify team (Dr. Ahmed) when a new RFQ comes in
export async function sendQuoteNotification(data: {
  quoteNumber: string;
  contactName: string;
  organization?: string | null;
  email: string;
  itemCount: number;
}): Promise<boolean> {
  const { teamNumber } = getConfig();
  if (!teamNumber) return false;

  return sendWhatsAppAPI(teamNumber, {
    type: "template",
    template: {
      name: "new_quote_request",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.quoteNumber },
            { type: "text", text: data.contactName },
            { type: "text", text: data.organization || "N/A" },
            { type: "text", text: data.email },
            { type: "text", text: `${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}` },
          ],
        },
      ],
    },
  });
}

// Send quote confirmation to the customer
export async function sendQuoteConfirmation(data: {
  customerPhone: string;
  contactName: string;
  quoteNumber: string;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.customerPhone, {
    type: "template",
    template: {
      name: "quote_confirmation",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.contactName },
            { type: "text", text: data.quoteNumber },
          ],
        },
      ],
    },
  });
}

// Send PO notification to supplier — try template first, fall back to text
export async function sendPOToSupplier(data: {
  supplierPhone: string;
  poNumber: string;
  contactPerson: string;
  itemCount: number;
  subtotal: string;
}): Promise<boolean> {
  // Try template first
  const templateResult = await sendWhatsAppAPI(data.supplierPhone, {
    type: "template",
    template: {
      name: "purchase_order_notification",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.poNumber },
            { type: "text", text: data.contactPerson },
            { type: "text", text: `${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}` },
            { type: "text", text: data.subtotal },
          ],
        },
      ],
    },
  });

  if (templateResult) return true;

  // Fallback to free-form text
  console.log("[WhatsApp] Template failed, trying free-form text");
  return sendWhatsAppAPI(data.supplierPhone, {
    type: "text",
    text: {
      body: `*Purchase Order: ${data.poNumber}*\n\nDear ${data.contactPerson},\n\nPlease find our purchase order:\n\n📦 Items: ${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}\n💰 Subtotal: ${data.subtotal}\n\nPlease confirm availability and delivery timeline.\n\nL&M Medical Solutions\ninfo@lmmedicalsolutions.org`,
    },
  });
}

// Notify customer that quote pricing is ready
export async function sendQuotePricingReady(data: {
  customerPhone: string;
  contactName: string;
  quoteNumber: string;
  itemCount: number;
  total: string;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.customerPhone, {
    type: "template",
    template: {
      name: "quote_pricing_ready",
      language: { code: "en_US" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: data.contactName },
          { type: "text", text: data.quoteNumber },
          { type: "text", text: `${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}` },
          { type: "text", text: data.total },
        ],
      }],
    },
  });
}

// Notify customer that their order is confirmed
export async function sendOrderConfirmed(data: {
  customerPhone: string;
  contactName: string;
  orderNumber: string;
  itemCount: number;
  total: string;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.customerPhone, {
    type: "template",
    template: {
      name: "order_confirmed",
      language: { code: "en_US" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: data.contactName },
          { type: "text", text: data.orderNumber },
          { type: "text", text: `${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}` },
          { type: "text", text: data.total },
        ],
      }],
    },
  });
}

// Send invoice payment request to customer
export async function sendInvoicePaymentRequest(data: {
  customerPhone: string;
  contactName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.customerPhone, {
    type: "template",
    template: {
      name: "invoice_payment_request",
      language: { code: "en_US" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: data.contactName },
          { type: "text", text: data.invoiceNumber },
          { type: "text", text: data.total },
          { type: "text", text: data.dueDate },
        ],
      }],
    },
  });
}

// Confirm payment received to customer
export async function sendPaymentConfirmed(data: {
  customerPhone: string;
  contactName: string;
  invoiceNumber: string;
  amount: string;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.customerPhone, {
    type: "template",
    template: {
      name: "payment_confirmed",
      language: { code: "en_US" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: data.contactName },
          { type: "text", text: data.invoiceNumber },
          { type: "text", text: data.amount },
        ],
      }],
    },
  });
}

// Notify customer that order has shipped
export async function sendOrderShipped(data: {
  customerPhone: string;
  contactName: string;
  orderNumber: string;
  itemCount: number;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.customerPhone, {
    type: "template",
    template: {
      name: "order_shipped",
      language: { code: "en_US" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: data.contactName },
          { type: "text", text: data.orderNumber },
          { type: "text", text: `${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}` },
        ],
      }],
    },
  });
}

// Notify customer that order has been delivered
export async function sendOrderDelivered(data: {
  customerPhone: string;
  contactName: string;
  orderNumber: string;
  itemCount: number;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.customerPhone, {
    type: "template",
    template: {
      name: "order_delivered",
      language: { code: "en_US" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: data.contactName },
          { type: "text", text: data.orderNumber },
          { type: "text", text: `${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}` },
        ],
      }],
    },
  });
}

// Internal low stock alert to team
export async function sendLowStockAlert(data: {
  count: number;
  productList: string;
}): Promise<boolean> {
  const { teamNumber } = getConfig();
  if (!teamNumber) return false;
  return sendWhatsAppAPI(teamNumber, {
    type: "template",
    template: {
      name: "low_stock_alert",
      language: { code: "en_US" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: String(data.count) },
          { type: "text", text: data.productList },
        ],
      }],
    },
  });
}

// Welcome new customer
export async function sendWelcomeCustomer(data: {
  customerPhone: string;
  contactName: string;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.customerPhone, {
    type: "template",
    template: {
      name: "welcome_customer",
      language: { code: "en_US" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: data.contactName },
        ],
      }],
    },
  });
}

// Send a PDF document via WhatsApp using a public URL
export async function sendWhatsAppDocument(data: {
  to: string;
  documentUrl: string;
  filename: string;
  caption?: string;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.to, {
    type: "document",
    document: {
      link: data.documentUrl,
      filename: data.filename,
      caption: data.caption || "",
    },
  });
}

// Legacy: free-form text (only works within 24h conversation window)
export async function sendWhatsAppText(to: string, message: string): Promise<boolean> {
  return sendWhatsAppAPI(to, {
    type: "text",
    text: { body: message },
  });
}
