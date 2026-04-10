import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface CatalogRow {
  "Item Code": string;
  Category: string;
  "Item Name": string;
  "Variant / Size": string;
  Notes: string;
  "Stock Qty": number;
  "U.P (USD)": number;
  "Sale Price (USD)": number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedCategories(categories: string[]) {
  console.log(`Seeding ${categories.length} categories...`);

  const rows = categories.map((name, index) => ({
    name,
    slug: slugify(name),
    sort_order: index,
  }));

  const { error } = await supabase
    .from("categories")
    .upsert(rows, { onConflict: "name" });

  if (error) {
    console.error("Error seeding categories:", error.message);
    throw error;
  }

  console.log(`Seeded ${categories.length} categories.`);
}

async function seedProducts(products: CatalogRow[]) {
  console.log(`Seeding ${products.length} products...`);

  const rows = products.map((p) => ({
    item_code: p["Item Code"],
    category: p.Category,
    item_name: p["Item Name"],
    variant: p["Variant / Size"] || null,
    notes: p.Notes || null,
    stock_qty: p["Stock Qty"] || 0,
    cost_price_sdg: p["U.P (USD)"] || 0,
    sale_price_sdg: p["Sale Price (USD)"] || 0,
    cost_price_usd: 0,
    sale_price_usd: 0,
    is_active: true,
  }));

  // Insert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "item_code" });

    if (error) {
      console.error(`Error seeding batch ${i}:`, error.message);
      throw error;
    }

    console.log(`  Batch ${Math.floor(i / 50) + 1}: ${batch.length} products`);
  }

  console.log(`Seeded ${products.length} products total.`);
}

async function main() {
  const filePath = path.join(__dirname, "L&M MEDICAL SOLUTIONS.xlsx");
  console.log(`Reading ${filePath}...`);

  const workbook = XLSX.readFile(filePath);
  const catalogSheet = workbook.Sheets["Catalog"];

  if (!catalogSheet) {
    console.error("No 'Catalog' sheet found in workbook");
    process.exit(1);
  }

  const rawData = XLSX.utils.sheet_to_json<CatalogRow>(catalogSheet, {
    range: 4,
  });

  const products = rawData.filter(
    (row) => row["Item Code"] && row["Item Code"].toString().trim() !== ""
  );

  console.log(`Found ${products.length} products in Catalog sheet.`);

  const categories = [...new Set(products.map((p) => p.Category))].sort();
  console.log(`Found ${categories.length} categories: ${categories.join(", ")}`);

  await seedCategories(categories);
  await seedProducts(products);

  console.log("Seeding complete!");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
