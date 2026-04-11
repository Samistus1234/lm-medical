const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "";
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || "";
const WHATSAPP_TEAM_NUMBER = process.env.WHATSAPP_TEAM_NUMBER || "";

export function generateWhatsAppNotification(data: {
  quoteNumber: string;
  contactName: string;
  organization?: string | null;
  itemCount: number;
  email: string;
}): string {
  return [
    `🔔 *New Quote Request: ${data.quoteNumber}*`,
    ``,
    `👤 *Contact:* ${data.contactName}`,
    data.organization ? `🏢 *Organization:* ${data.organization}` : null,
    `📧 *Email:* ${data.email}`,
    `📦 *Items:* ${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}`,
    ``,
    `Review in CRM: https://lmmedicalsolutions.org/admin/quotes`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendWhatsAppNotification(message: string): Promise<boolean> {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_ID || !WHATSAPP_TEAM_NUMBER) {
    console.log("[WhatsApp] No API credentials — notification skipped");
    console.log("[WhatsApp] Message:", message);
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
          to: WHATSAPP_TEAM_NUMBER,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("[WhatsApp] API error:", JSON.stringify(err));
      return false;
    }

    console.log("[WhatsApp] Notification sent to", WHATSAPP_TEAM_NUMBER);
    return true;
  } catch (err) {
    console.error("[WhatsApp] Send failed:", err);
    return false;
  }
}
