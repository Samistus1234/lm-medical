// Seed new SKUs from the May 2026 Egypt Med Supplier offer:
//   - HIP / Bipolar Cemented (BPC)         family
//   - GAM extensions (nails diaxlen, locking screws, antirotation, lag fills)
//   - Gliding Nail (GLD)                   family
//   - Drill Battery (DRL)                  family
//
// Idempotent: upsert on item_code.

import { createClient } from "@supabase/supabase-js";
import {
  bulkGenerate,
  generateItemCode,
  expandRange,
  type GeneratedSku,
} from "../src/lib/item-code";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ProductRow {
  item_code: string;
  category: string;
  item_name: string;
  variant: string | null;
  notes: string | null;
  stock_qty: number;
  cost_price_sdg: number;
  sale_price_sdg: number;
  cost_price_usd: number;
  sale_price_usd: number;
  is_active: boolean;
}

function row(
  partial: Pick<ProductRow, "item_code" | "category" | "item_name"> &
    Partial<ProductRow>,
): ProductRow {
  return {
    variant: null,
    notes: null,
    stock_qty: 0,
    cost_price_sdg: 0,
    sale_price_sdg: 0,
    cost_price_usd: 0,
    sale_price_usd: 0,
    is_active: true,
    ...partial,
  };
}

function rowsFrom(
  skus: GeneratedSku[],
  category: string,
  itemName: string,
): ProductRow[] {
  return skus.map((s) =>
    row({
      item_code: s.itemCode,
      category,
      item_name: itemName,
      variant: s.variant,
    }),
  );
}

const rows: ProductRow[] = [];

// ---------- 1. Bipolar Cemented Hip system ---------------------------------

// Stems: Ø6.25 -> 15.00mm step 1.25 (8 sizes)
rows.push(
  ...rowsFrom(
    bulkGenerate({
      family: "bipolarCemented",
      component: "stem",
      vary: {
        kind: "diameter",
        range: { from: 6.25, to: 15.0, step: 1.25, decimals: 2 },
      },
    }),
    "Bipolar Cemented",
    "Straight Cemented Stem",
  ),
);

// Heads: 28mm Short / Medium / Long / X Long / XX Long (5)
rows.push(
  ...rowsFrom(
    bulkGenerate({
      family: "bipolarCemented",
      component: "head28",
      vary: { kind: "size", values: ["S", "M", "L", "XL", "XXL"] },
    }),
    "Bipolar Cemented",
    "Head 28mm",
  ),
);

// Cups: Ø42 -> 54mm (13)
rows.push(
  ...rowsFrom(
    bulkGenerate({
      family: "bipolarCemented",
      component: "cup",
      vary: { kind: "diameter", range: { from: 42, to: 54, step: 1 } },
    }),
    "Bipolar Cemented",
    "Bipolar Cup",
  ),
);

// Instrument Set
rows.push(
  row({
    item_code: generateItemCode({ family: "bipolarCemented", component: "set" }),
    category: "Bipolar Cemented",
    item_name: "Instrument Set of Bipolar (Femoral Set + Bipolar Cup Set)",
  }),
);

// ---------- 2. Gamma System extensions -------------------------------------

// Gamma Nail Titanium: Ø10/11/12/13 × L180/200/220/240 (16)
rows.push(
  ...rowsFrom(
    bulkGenerate({
      family: "gammaSystem",
      component: "nail",
      vary: { kind: "diaXlen" },
      cross: {
        diameters: ["10", "11", "12", "13"],
        lengths: ["180", "200", "220", "240"],
      },
    }),
    "Gamma System",
    "Gamma Nail Titanium",
  ),
);

// Lag screws — fill missing lengths (existing has L80, L85, L90, L95, L100)
// New: L70, L75, L105, L110, L115, L120 (6)
rows.push(
  ...rowsFrom(
    bulkGenerate({
      family: "gammaSystem",
      component: "lag",
      vary: { kind: "length", values: ["70", "75", "105", "110", "115", "120"] },
    }),
    "Gamma System",
    "Lag Screw for Gamma Nail (10.5mm)",
  ),
);

// Antirotation Screw 6.4mm L70-L120 step 5 (11)
rows.push(
  ...rowsFrom(
    bulkGenerate({
      family: "gammaSystem",
      component: "antirotationScrew",
      vary: { kind: "length", range: { from: 70, to: 120, step: 5 } },
    }),
    "Gamma System",
    "Antirotation Screw 6.4mm",
  ),
);

// Antirotation Cap (1)
rows.push(
  row({
    item_code: generateItemCode({
      family: "gammaSystem",
      component: "antirotationCap",
    }),
    category: "Gamma System",
    item_name: "Antirotation Cap",
  }),
);

// Locking Screw 4.8mm L25-L60 step 5 (8)
rows.push(
  ...rowsFrom(
    bulkGenerate({
      family: "gammaSystem",
      component: "lockingScrew",
      vary: { kind: "length", range: { from: 25, to: 60, step: 5 } },
    }),
    "Gamma System",
    "Locking Screw 4.8mm",
  ),
);

// ---------- 3. Gliding Nail ------------------------------------------------

// Gliding Nail Ø2.0/2.5/3.0/3.5/4.0/4.5 × L450 (6)
rows.push(
  ...rowsFrom(
    bulkGenerate({
      family: "glidingNail",
      component: "nail",
      vary: { kind: "diaXlen" },
      cross: {
        diameters: ["2.0", "2.5", "3.0", "3.5", "4.0", "4.5"],
        lengths: ["450"],
      },
    }),
    "Gliding Nail",
    "Gliding Nail",
  ),
);

// Instrument Set of Gliding Nail
rows.push(
  row({
    item_code: generateItemCode({ family: "glidingNail", component: "set" }),
    category: "Gliding Nail",
    item_name: "Instrument Set of Gliding Nail",
  }),
);

// ---------- 4. Drill Battery -----------------------------------------------

rows.push(
  row({
    item_code: generateItemCode({ family: "drill", component: "battery" }),
    category: "Power Tools",
    item_name: "Drill Battery",
  }),
);

// ---------------------------------------------------------------------------

async function main() {
  console.log(`Seeding ${rows.length} new SKUs.`);
  console.log(rows.map((r) => `  ${r.item_code.padEnd(22)} ${r.item_name}${r.variant ? `  [${r.variant}]` : ""}`).join("\n"));

  // Categories present in the seed (categories table has its own rows)
  const cats = [...new Set(rows.map((r) => r.category))].sort();
  for (const name of cats) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase
      .from("categories")
      .upsert({ name, slug }, { onConflict: "name" });
    if (error) console.warn(`category upsert "${name}":`, error.message);
  }

  // Bulk upsert products on item_code
  const { error, count } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "item_code", count: "exact" });
  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }
  console.log(`Upserted ${count ?? rows.length} products.`);

  // Soft-delete junk + legacy GAM-NAIL-{10,11,12} (replaced by diaxlen variants)
  const toRetire = ["00", "ddddd", "daas", "GAM-NAIL-10", "GAM-NAIL-11", "GAM-NAIL-12"];
  const { data: retired, error: retErr } = await supabase
    .from("products")
    .update({ is_active: false })
    .in("item_code", toRetire)
    .select("item_code");
  if (retErr) console.warn("retire failed:", retErr.message);
  else console.log(`Retired ${retired?.length ?? 0} legacy/junk rows: ${retired?.map((r) => r.item_code).join(", ") || "(none)"}`);

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
