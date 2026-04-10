"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function inviteMember(formData: FormData) {
  const admin = createAdminClient();
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (authError) return { error: authError.message };

  const { error: teamError } = await admin.from("team_members").insert({
    id: authData.user.id, name, email, role, is_active: true,
  });
  if (teamError) return { error: teamError.message };
  revalidatePath("/admin/team");
  return { success: true };
}

export async function updateMemberRole(id: string, role: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/team");
  return { success: true };
}

export async function toggleMemberActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/team");
  return { success: true };
}
