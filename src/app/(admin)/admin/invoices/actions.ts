"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();
  const updates: any = { status };
  if (status === "paid") updates.paid_at = new Date().toISOString();
  const { error } = await supabase.from("invoices").update(updates).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/invoices");
  return { success: true };
}
