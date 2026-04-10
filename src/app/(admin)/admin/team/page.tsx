import { createClient } from "@/lib/supabase/server";
import { TeamList } from "./team-list";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: members } = await supabase.from("team_members").select("*").order("name");
  return (
    <div>
      <h1 className="text-3xl font-light mb-6" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Team</h1>
      <TeamList members={members || []} />
    </div>
  );
}
