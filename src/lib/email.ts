import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] (dev mode — no SMTP credentials)");
    console.log("[Email] To:", options.to);
    console.log("[Email] Subject:", options.subject);
    console.log("[Email] Body preview:", options.html.substring(0, 200));
    return true;
  }

  try {
    await transporter.sendMail({
      from: options.from || `"L&M Medical Solutions" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (err) {
    console.error("[Email] Send failed:", err);
    return false;
  }
}

export function buildInvoiceEmail(data: {
  contactName: string;
  invoiceNumber: string;
  total: string;
  currency: string;
  dueDate: string;
  pdfUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Invoice ${data.invoiceNumber} from L&M Medical Solutions`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0a1628;max-width:600px;margin:0 auto;padding:20px;">
  <div style="border-bottom:2px solid #1a6bb5;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="font-size:22px;font-weight:300;margin:0;">L&amp;M Medical Solutions</h1>
  </div>
  <p style="font-size:15px;">Dear ${data.contactName},</p>
  <p style="font-size:15px;color:#64748d;">Your invoice is ready. Please find the details and PDF link below.</p>
  <div style="background:#f8fafc;border:1px solid #e5edf5;border-radius:6px;padding:20px;margin:24px 0;">
    <p style="font-size:13px;color:#64748d;margin:0 0 4px;">Invoice</p>
    <p style="font-size:18px;color:#1a6bb5;margin:0 0 16px;">${data.invoiceNumber}</p>
    <table style="width:100%;font-size:13px;color:#273951;">
      <tr><td style="padding:4px 0;color:#64748d;">Amount Due</td><td style="text-align:right;font-weight:600;">${data.total} ${data.currency}</td></tr>
      <tr><td style="padding:4px 0;color:#64748d;">Due Date</td><td style="text-align:right;">${data.dueDate}</td></tr>
    </table>
  </div>
  <p style="margin:24px 0;">
    <a href="${data.pdfUrl}" style="display:inline-block;background:#1a6bb5;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;">View / Download Invoice PDF</a>
  </p>
  <p style="font-size:13px;color:#64748d;">Please reference invoice number <strong>${data.invoiceNumber}</strong> on all remittances.</p>
  <div style="border-top:1px solid #e5edf5;margin-top:32px;padding-top:16px;text-align:center;">
    <p style="font-size:11px;color:#94a3b8;">L&amp;M Medical Solutions — Khartoum, Sudan | info@lmmedicalsolutions.org</p>
  </div>
</body></html>`,
  };
}

export function buildReceiptEmail(data: {
  contactName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  pdfUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Payment Received — ${data.invoiceNumber}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0a1628;max-width:600px;margin:0 auto;padding:20px;">
  <div style="border-bottom:2px solid #10b981;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="font-size:22px;font-weight:300;margin:0;">L&amp;M Medical Solutions</h1>
  </div>
  <p style="font-size:15px;">Dear ${data.contactName},</p>
  <p style="font-size:15px;color:#64748d;">We've received your payment. Thank you.</p>
  <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:20px;margin:24px 0;">
    <p style="font-size:13px;color:#059669;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Payment Confirmed</p>
    <p style="font-size:18px;color:#065f46;margin:0 0 16px;">${data.invoiceNumber}</p>
    <table style="width:100%;font-size:13px;color:#273951;">
      <tr><td style="padding:4px 0;color:#64748d;">Amount</td><td style="text-align:right;font-weight:600;">${data.amount} ${data.currency}</td></tr>
    </table>
  </div>
  <p style="margin:24px 0;">
    <a href="${data.pdfUrl}" style="display:inline-block;background:#10b981;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;">Download Receipt PDF</a>
  </p>
  <div style="border-top:1px solid #e5edf5;margin-top:32px;padding-top:16px;text-align:center;">
    <p style="font-size:11px;color:#94a3b8;">L&amp;M Medical Solutions — Khartoum, Sudan | info@lmmedicalsolutions.org</p>
  </div>
</body></html>`,
  };
}

export function buildQuoteConfirmationEmail(data: {
  quoteNumber: string;
  contactName: string;
  items: { name: string; variant?: string | null; quantity: number }[];
}): { subject: string; html: string } {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5edf5;">${item.name}${item.variant ? ` — ${item.variant}` : ""}</td><td style="padding:8px 12px;border-bottom:1px solid #e5edf5;text-align:right;">${item.quantity}</td></tr>`
    )
    .join("");

  return {
    subject: `Quote Request Received — ${data.quoteNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0a1628;max-width:600px;margin:0 auto;padding:20px;">
  <div style="border-bottom:2px solid #1a6bb5;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="font-size:22px;font-weight:300;color:#0a1628;margin:0;">L&M Medical Solutions</h1>
  </div>

  <p style="font-size:15px;">Dear ${data.contactName},</p>
  <p style="font-size:15px;color:#64748d;">Thank you for your quote request. We've received it and our team will review it shortly.</p>

  <div style="background:#f8fafc;border:1px solid #e5edf5;border-radius:6px;padding:16px;margin:24px 0;">
    <p style="font-size:13px;color:#64748d;margin:0 0 4px;">Quote Reference</p>
    <p style="font-size:18px;color:#1a6bb5;margin:0;font-weight:400;">${data.quoteNumber}</p>
  </div>

  <h3 style="font-size:14px;color:#273951;font-weight:400;margin-bottom:12px;">Requested Items</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead><tr>
      <th style="text-align:left;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5edf5;color:#273951;font-weight:500;font-size:11px;text-transform:uppercase;">Product</th>
      <th style="text-align:right;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5edf5;color:#273951;font-weight:500;font-size:11px;text-transform:uppercase;">Qty</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>

  <p style="font-size:14px;color:#64748d;margin-top:24px;">We will contact you within <strong>24-48 hours</strong> with pricing and availability.</p>

  <div style="border-top:1px solid #e5edf5;margin-top:32px;padding-top:16px;text-align:center;">
    <p style="font-size:11px;color:#94a3b8;">L&M Medical Solutions — Premium Orthopedic Implants & Surgical Supplies</p>
    <p style="font-size:11px;color:#94a3b8;">Khartoum, Sudan | info@lmmedicalsolutions.org</p>
  </div>
</body>
</html>`,
  };
}
