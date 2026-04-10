// Simple WhatsApp notification via wa.me deep link generation
// For production: integrate Meta WhatsApp Cloud API

const TEAM_WHATSAPP = process.env.WHATSAPP_PHONE_ID || "";

export function generateWhatsAppNotification(data: {
  quoteNumber: string;
  contactName: string;
  organization?: string | null;
  itemCount: number;
  email: string;
}): string {
  const message = [
    `🔔 New Quote Request: ${data.quoteNumber}`,
    `👤 ${data.contactName}${data.organization ? ` — ${data.organization}` : ""}`,
    `📧 ${data.email}`,
    `📦 ${data.itemCount} item${data.itemCount !== 1 ? "s" : ""}`,
    ``,
    `Review in CRM: /admin/quotes`,
  ].join("\n");

  return message;
}

export async function sendWhatsAppNotification(message: string): Promise<boolean> {
  // If WhatsApp API credentials are set, use Meta Cloud API
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.log("[WhatsApp] No API credentials — notification skipped");
    console.log("[WhatsApp] Message:", message);
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneId,
          type: "text",
          text: { body: message },
        }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error("[WhatsApp] Send failed:", err);
    return false;
  }
}
