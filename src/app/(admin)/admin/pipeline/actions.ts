"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDeal(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("pipeline_deals").insert({
    customer_id: formData.get("customer_id") as string,
    title: formData.get("title") as string,
    stage: formData.get("stage") as string || "lead",
    value_sdg: parseFloat(formData.get("value_sdg") as string) || null,
    value_usd: parseFloat(formData.get("value_usd") as string) || null,
    probability: parseInt(formData.get("probability") as string) || 0,
    expected_close: (formData.get("expected_close") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/pipeline");
  return { success: true };
}

export async function updateDealStage(id: string, stage: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pipeline_deals").update({ stage }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/pipeline");
  return { success: true };
}
