const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "";
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || "";
const WHATSAPP_TEAM_NUMBER = process.env.WHATSAPP_TEAM_NUMBER || "";

async function sendWhatsAppAPI(to: string, payload: Record<string, unknown>): Promise<boolean> {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_ID) {
    console.log("[WhatsApp] No API credentials — skipped");
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
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
  if (!WHATSAPP_TEAM_NUMBER) return false;

  return sendWhatsAppAPI(WHATSAPP_TEAM_NUMBER, {
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

// Send order status update to customer
export async function sendOrderUpdate(data: {
  customerPhone: string;
  orderNumber: string;
  customerName: string;
  status: string;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.customerPhone, {
    type: "template",
    template: {
      name: "order_update",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.orderNumber },
            { type: "text", text: data.customerName },
            { type: "text", text: data.status },
          ],
        },
      ],
    },
  });
}

// Send PO notification to supplier via template
export async function sendPOToSupplier(data: {
  supplierPhone: string;
  poNumber: string;
  contactPerson: string;
  itemCount: number;
  subtotal: string;
}): Promise<boolean> {
  return sendWhatsAppAPI(data.supplierPhone, {
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
}

// Legacy: free-form text (only works within 24h conversation window)
export async function sendWhatsAppText(to: string, message: string): Promise<boolean> {
  return sendWhatsAppAPI(to, {
    type: "text",
    text: { body: message },
  });
}
