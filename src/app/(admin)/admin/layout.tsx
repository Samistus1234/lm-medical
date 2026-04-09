import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: member } = await supabase
    .from("team_members")
    .select("name, role")
    .eq("id", user.id)
    .single();

  const userName = member?.name || user.email || "User";
  const userRole = member?.role || "viewer";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar userName={userName} userRole={userRole} />
        <main className="flex-1 p-6" style={{ backgroundColor: "#f8fafc" }}>{children}</main>
      </div>
    </div>
  );
}
