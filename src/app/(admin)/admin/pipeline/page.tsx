import { createClient } from "@/lib/supabase/server";
import { PipelineBoard } from "./pipeline-board";

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: deals } = await supabase.from("pipeline_deals").select("*, customers(name)").order("created_at");
  const { data: customers } = await supabase.from("customers").select("id, name").order("name");
  return (
    <div>
      <h1 className="text-3xl font-light mb-6" style={{ color: "#0a1628", letterSpacing: "-0.64px" }}>Sales Pipeline</h1>
      <PipelineBoard deals={deals || []} customers={customers || []} />
    </div>
  );
}
