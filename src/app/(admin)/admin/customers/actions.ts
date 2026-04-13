"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendWelcomeCustomer } from "@/lib/whatsapp";

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const phone = (formData.get("phone") as string) || null;
  const contactPerson = (formData.get("contact_person") as string) || null;
  const name = formData.get("name") as string;

  const { error } = await supabase.from("customers").insert({
    name,
    type: formData.get("type") as string,
    contact_person: contactPerson,
    email: (formData.get("email") as string) || null,
    phone,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    country: (formData.get("country") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  if (error) return { error: error.message };

  // Send welcome WhatsApp to new customer
  if (phone) {
    const cleanPhone = phone.replace(/[\s\-\+]/g, "");
    sendWelcomeCustomer({
      customerPhone: cleanPhone,
      contactName: contactPerson || name,
    }).catch(console.error);
  }

  revalidatePath("/admin/customers");
  return { success: true };
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").update({
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    contact_person: (formData.get("contact_person") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    country: (formData.get("country") as string) || null,
    notes: (formData.get("notes") as string) || null,
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/customers");
  return { success: true };
}
