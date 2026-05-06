// Item-code generator for the L&M Medical catalogue.
//
// Pattern (inferred from existing data):
//   {FAMILY}[-{COMPONENT}]-{SIZE_TOKENS...}
//
// Size tokens are emitted in the order supplied and joined with '-'.
// Numbers are passed through verbatim (decimals kept: e.g. "3.0", "6.25").

export type SizeKind =
  | "diameter" //   3.0    -> "3.0"          (Ø in mm)
  | "length" //     16     -> "L16"          (length in mm)
  | "holes" //      5      -> "5H"           (plate hole count)
  | "side" //       "L"|"R"-> "L"|"R"        (anatomic side)
  | "size" //       "S"... -> "S/M/L/XL/XXL" (generic size letter)
  | "diaXlen" //    {d,l}  -> "10X180"       (diameter × length)
  | "raw"; //       any    -> verbatim       (escape hatch)

export type SizeToken =
  | { kind: "diameter"; value: number | string }
  | { kind: "length"; value: number | string }
  | { kind: "holes"; value: number }
  | { kind: "side"; value: "L" | "R" }
  | { kind: "size"; value: "S" | "M" | "L" | "XL" | "XXL" }
  | { kind: "diaXlen"; diameter: number | string; length: number | string }
  | { kind: "raw"; value: string };

export interface FamilySpec {
  prefix: string;
  category: string; // canonical category name written to products.category
  components?: Record<string, string>; // component slug -> code, e.g. { stem: "STM" }
}

// Catalogue of known families. Adding a new family means adding one entry here
// and the rest of the system (UI dropdowns, generator, bulk-add) picks it up.
export const FAMILIES: Record<string, FamilySpec> = {
  cancellousScrew: { prefix: "CCS", category: "Cancellous Screws" },
  cannulatedScrew: { prefix: "CAN", category: "Cannulated Screws" },
  corticalScrew: { prefix: "CS", category: "Screws" },
  schanzScrew: { prefix: "SCH", category: "Schanz Screws" },
  kWire: { prefix: "KW", category: "Wires" },
  cerclage: { prefix: "CER", category: "Wires" },
  tenNail: { prefix: "TEN", category: "Nails" },
  externalFixator: { prefix: "EXT", category: "External Fixator" },
  dcpPlate: { prefix: "DCP", category: "Plates" },
  distalFemurLockedPlate: { prefix: "DFLP", category: "Locked Plates" },
  lockedScrew: { prefix: "LOCK", category: "Locked Screws" },
  gammaSystem: {
    prefix: "GAM",
    category: "Gamma System",
    components: {
      nail: "NAIL",
      lag: "LAG",
      distalLockingScrew: "DLS",
      lockingScrew: "LS",
      antirotationScrew: "ARS",
      antirotationCap: "ARC",
      set: "SET",
    },
  },
  bipolarCemented: {
    prefix: "BPC",
    category: "Bipolar Cemented",
    components: {
      stem: "STM",
      head28: "HD28",
      cup: "CUP",
      set: "SET",
    },
  },
  glidingNail: {
    prefix: "GLD",
    category: "Gliding Nail",
    components: { nail: "NAIL", set: "SET" },
  },
  drill: {
    prefix: "DRL",
    category: "Power Tools",
    components: { battery: "BATT" },
  },
};

export type FamilyKey = keyof typeof FAMILIES;

function tokenToString(t: SizeToken): string {
  switch (t.kind) {
    case "diameter":
      return String(t.value);
    case "length":
      return `L${t.value}`;
    case "holes":
      return `${t.value}H`;
    case "side":
      return t.value;
    case "size":
      return t.value;
    case "diaXlen":
      return `${t.diameter}X${t.length}`;
    case "raw":
      return t.value;
  }
}

export interface GenerateInput {
  family: FamilyKey;
  component?: string; // key into FAMILIES[family].components
  tokens?: SizeToken[];
}

export function generateItemCode(input: GenerateInput): string {
  const fam = FAMILIES[input.family];
  if (!fam) throw new Error(`Unknown family: ${input.family}`);

  const parts: string[] = [fam.prefix];

  if (input.component) {
    const comp = fam.components?.[input.component];
    if (!comp)
      throw new Error(
        `Unknown component "${input.component}" for family ${input.family}`,
      );
    parts.push(comp);
  }

  for (const t of input.tokens ?? []) parts.push(tokenToString(t));

  // Some legacy codes glue diameter directly to family prefix (e.g. "CCS40").
  // We emit hyphenated form by default; the seed/script can override via raw tokens
  // when faithfulness to legacy formatting matters.
  return parts.join("-");
}

// --- Bulk generation -------------------------------------------------------

export interface NumericRange {
  from: number;
  to: number;
  step: number;
  decimals?: number; // number of decimals to keep when formatting (default 0)
}

export function expandRange(r: NumericRange): string[] {
  const out: string[] = [];
  const dp = r.decimals ?? 0;
  // Avoid floating-point drift: scale, iterate as ints, format on output.
  const scale = Math.pow(10, Math.max(dp, 4));
  const start = Math.round(r.from * scale);
  const end = Math.round(r.to * scale);
  const step = Math.round(r.step * scale);
  if (step <= 0) throw new Error("step must be > 0");
  for (let v = start; v <= end; v += step) {
    out.push((v / scale).toFixed(dp));
  }
  return out;
}

export interface BulkGenerateInput {
  family: FamilyKey;
  component?: string;
  // The varying token. Each value yields one SKU.
  vary: { kind: SizeKind; range?: NumericRange; values?: string[] };
  // Optional fixed leading tokens (e.g. diameter when length is what varies).
  fixedTokens?: SizeToken[];
  // For diaXlen: pair each diameter with each length (cross product) when provided.
  cross?: { diameters: string[]; lengths: string[] };
}

export interface GeneratedSku {
  itemCode: string;
  variant: string; // human-readable, e.g. "L80" / "42 mm" / "10×180 mm"
  tokens: SizeToken[];
}

export function bulkGenerate(input: BulkGenerateInput): GeneratedSku[] {
  const out: GeneratedSku[] = [];

  if (input.vary.kind === "diaXlen") {
    const { diameters = [], lengths = [] } = input.cross ?? {
      diameters: [],
      lengths: [],
    };
    for (const d of diameters) {
      for (const l of lengths) {
        const tokens: SizeToken[] = [
          ...(input.fixedTokens ?? []),
          { kind: "diaXlen", diameter: d, length: l },
        ];
        out.push({
          itemCode: generateItemCode({
            family: input.family,
            component: input.component,
            tokens,
          }),
          variant: `${d}×${l} mm`,
          tokens,
        });
      }
    }
    return out;
  }

  const values =
    input.vary.values ??
    (input.vary.range ? expandRange(input.vary.range) : []);

  for (const v of values) {
    let varying: SizeToken;
    let humanVariant: string;
    switch (input.vary.kind) {
      case "diameter":
        varying = { kind: "diameter", value: v };
        humanVariant = `${v} mm`;
        break;
      case "length":
        varying = { kind: "length", value: v };
        humanVariant = `L${v}`;
        break;
      case "holes":
        varying = { kind: "holes", value: Number(v) };
        humanVariant = `${v} holes`;
        break;
      case "side":
        varying = { kind: "side", value: v as "L" | "R" };
        humanVariant = v === "L" ? "Left" : "Right";
        break;
      case "size":
        varying = { kind: "size", value: v as "S" | "M" | "L" | "XL" | "XXL" };
        humanVariant = v;
        break;
      case "raw":
        varying = { kind: "raw", value: v };
        humanVariant = v;
        break;
      default:
        throw new Error(`Unsupported vary kind: ${input.vary.kind}`);
    }
    const tokens: SizeToken[] = [...(input.fixedTokens ?? []), varying];
    out.push({
      itemCode: generateItemCode({
        family: input.family,
        component: input.component,
        tokens,
      }),
      variant: humanVariant,
      tokens,
    });
  }

  return out;
}
