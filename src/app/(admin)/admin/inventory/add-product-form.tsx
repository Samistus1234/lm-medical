"use client";

import { useMemo, useState } from "react";
import {
  FAMILIES,
  type FamilyKey,
  bulkGenerate,
  generateItemCode,
  type GeneratedSku,
  type SizeKind,
} from "@/lib/item-code";
import { createProduct, createProductsBulk } from "./actions";

interface Supplier {
  id: string;
  name: string;
}

interface Props {
  suppliers: Supplier[];
  onDone: () => void;
}

const FAMILY_LABELS: Record<FamilyKey, string> = {
  cancellousScrew: "Cancellous Screw (CCS)",
  cannulatedScrew: "Cannulated Screw (CAN)",
  corticalScrew: "Cortical Screw (CS)",
  schanzScrew: "Schanz Screw (SCH)",
  kWire: "K-Wire (KW)",
  cerclage: "Cerclage Wire (CER)",
  tenNail: "TEN Nail (TEN)",
  externalFixator: "External Fixator (EXT)",
  dcpPlate: "DCP Plate (DCP)",
  distalFemurLockedPlate: "Distal Femur Locked Plate (DFLP)",
  lockedScrew: "Locked Screw (LOCK)",
  gammaSystem: "Gamma System (GAM)",
  bipolarCemented: "Bipolar Cemented Hip (BPC)",
  glidingNail: "Gliding Nail (GLD)",
  drill: "Power Tool / Drill (DRL)",
};

type Mode = "single" | "bulk";
type VaryKind = Exclude<SizeKind, "raw">;

const VARY_OPTIONS: { value: VaryKind; label: string }[] = [
  { value: "diameter", label: "Diameter (mm)" },
  { value: "length", label: "Length (mm)" },
  { value: "diaXlen", label: "Diameter × Length" },
  { value: "holes", label: "Hole count" },
  { value: "side", label: "Side (L/R)" },
  { value: "size", label: "Size (S/M/L/XL/XXL)" },
];

export function AddProductForm({ suppliers, onDone }: Props) {
  const [mode, setMode] = useState<Mode>("single");
  const [family, setFamily] = useState<FamilyKey>("bipolarCemented");
  const [component, setComponent] = useState<string>("");
  const [itemName, setItemName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [stockQty, setStockQty] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single
  const [singleVary, setSingleVary] = useState<VaryKind>("length");
  const [singleValue, setSingleValue] = useState("");
  const [singleDiameter, setSingleDiameter] = useState("");

  // Bulk
  const [bulkVary, setBulkVary] = useState<VaryKind>("length");
  const [bulkRangeFrom, setBulkRangeFrom] = useState("");
  const [bulkRangeTo, setBulkRangeTo] = useState("");
  const [bulkRangeStep, setBulkRangeStep] = useState("");
  const [bulkDecimals, setBulkDecimals] = useState("0");
  const [bulkValues, setBulkValues] = useState("");
  // For diaXlen
  const [bulkDiameters, setBulkDiameters] = useState("");
  const [bulkLengths, setBulkLengths] = useState("");
  // Optional fixed token (e.g. plate side when length varies)
  const [fixedSide, setFixedSide] = useState<"" | "L" | "R">("");

  const fam = FAMILIES[family];
  const components = fam.components ?? {};
  const componentKeys = Object.keys(components);

  // Live preview ----------------------------------------------------------
  const previewSkus: GeneratedSku[] = useMemo(() => {
    try {
      setError(null);
      if (mode === "single") {
        if (singleVary === "diaXlen") {
          if (!singleDiameter || !singleValue) return [];
          return [
            {
              itemCode: generateItemCode({
                family,
                component: component || undefined,
                tokens: [
                  { kind: "diaXlen", diameter: singleDiameter, length: singleValue },
                ],
              }),
              variant: `${singleDiameter}×${singleValue} mm`,
              tokens: [],
            },
          ];
        }
        if (!singleValue && !["size", "side"].includes(singleVary)) {
          // No value yet — show base code if no tokens needed
          if (!componentKeys.length || component) {
            return [
              {
                itemCode: generateItemCode({
                  family,
                  component: component || undefined,
                }),
                variant: "",
                tokens: [],
              },
            ];
          }
          return [];
        }
        const tokens =
          singleVary === "diameter"
            ? [{ kind: "diameter" as const, value: singleValue }]
            : singleVary === "length"
              ? [{ kind: "length" as const, value: singleValue }]
              : singleVary === "holes"
                ? [{ kind: "holes" as const, value: Number(singleValue) }]
                : singleVary === "side"
                  ? [{ kind: "side" as const, value: singleValue as "L" | "R" }]
                  : singleVary === "size"
                    ? [
                        {
                          kind: "size" as const,
                          value: singleValue as "S" | "M" | "L" | "XL" | "XXL",
                        },
                      ]
                    : [];
        return [
          {
            itemCode: generateItemCode({
              family,
              component: component || undefined,
              tokens,
            }),
            variant:
              singleVary === "length"
                ? `L${singleValue}`
                : singleVary === "diameter"
                  ? `${singleValue} mm`
                  : singleVary === "holes"
                    ? `${singleValue} holes`
                    : singleVary === "side"
                      ? singleValue === "L"
                        ? "Left"
                        : "Right"
                      : singleValue,
            tokens,
          },
        ];
      }

      // Bulk
      const fixedTokens =
        fixedSide && family === "distalFemurLockedPlate"
          ? [{ kind: "side" as const, value: fixedSide }]
          : [];

      if (bulkVary === "diaXlen") {
        const diameters = parseList(bulkDiameters);
        const lengths = parseList(bulkLengths);
        if (!diameters.length || !lengths.length) return [];
        return bulkGenerate({
          family,
          component: component || undefined,
          vary: { kind: "diaXlen" },
          cross: { diameters, lengths },
          fixedTokens,
        });
      }

      const explicit = parseList(bulkValues);
      if (explicit.length) {
        return bulkGenerate({
          family,
          component: component || undefined,
          vary: { kind: bulkVary, values: explicit },
          fixedTokens,
        });
      }

      const from = Number(bulkRangeFrom);
      const to = Number(bulkRangeTo);
      const step = Number(bulkRangeStep);
      if (!isFinite(from) || !isFinite(to) || !isFinite(step) || step <= 0) return [];
      return bulkGenerate({
        family,
        component: component || undefined,
        vary: {
          kind: bulkVary,
          range: { from, to, step, decimals: Number(bulkDecimals) || 0 },
        },
        fixedTokens,
      });
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [
    mode,
    family,
    component,
    componentKeys.length,
    singleVary,
    singleValue,
    singleDiameter,
    bulkVary,
    bulkRangeFrom,
    bulkRangeTo,
    bulkRangeStep,
    bulkDecimals,
    bulkValues,
    bulkDiameters,
    bulkLengths,
    fixedSide,
  ]);

  async function handleSubmit() {
    if (!itemName.trim()) {
      setError("Item name is required.");
      return;
    }
    if (!previewSkus.length) {
      setError("No SKUs to create — fill in size inputs.");
      return;
    }
    setSubmitting(true);
    try {
      if (previewSkus.length === 1) {
        const sku = previewSkus[0];
        const fd = new FormData();
        fd.set("item_code", sku.itemCode);
        fd.set("item_name", itemName);
        fd.set("category", fam.category);
        fd.set("variant", sku.variant);
        fd.set("stock_qty", stockQty);
        fd.set("cost_price_sdg", "0");
        fd.set("sale_price_sdg", "0");
        fd.set("cost_price_usd", "0");
        fd.set("sale_price_usd", "0");
        fd.set("notes", "");
        if (supplierId) fd.set("supplier_id", supplierId);
        const res = await createProduct(fd);
        if ("error" in res && res.error) throw new Error(res.error);
      } else {
        const res = await createProductsBulk(
          previewSkus.map((s) => ({
            item_code: s.itemCode,
            item_name: itemName,
            category: fam.category,
            variant: s.variant || null,
            stock_qty: Number(stockQty) || 0,
            supplier_id: supplierId || null,
          })),
        );
        if ("error" in res && res.error) throw new Error(res.error);
      }
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["single", "bulk"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="px-3 py-1.5 text-sm rounded-[4px] capitalize"
            style={{
              backgroundColor: mode === m ? "#1a6bb5" : "#f1f5f9",
              color: mode === m ? "white" : "#273951",
            }}
          >
            {m === "bulk" ? "Bulk add (range)" : "Single"}
          </button>
        ))}
      </div>

      {/* Family + component */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Family *">
          <select
            value={family}
            onChange={(e) => {
              setFamily(e.target.value as FamilyKey);
              setComponent("");
            }}
            className={inputCls}
          >
            {(Object.keys(FAMILIES) as FamilyKey[]).map((k) => (
              <option key={k} value={k}>
                {FAMILY_LABELS[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={componentKeys.length ? "Component *" : "Component"}>
          <select
            value={component}
            onChange={(e) => setComponent(e.target.value)}
            disabled={!componentKeys.length}
            className={inputCls}
          >
            <option value="">— none —</option>
            {componentKeys.map((c) => (
              <option key={c} value={c}>
                {c} ({components[c]})
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Item name *">
        <input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className={inputCls}
          placeholder="e.g. Bipolar Cup"
        />
      </Field>

      {/* Size inputs */}
      {mode === "single" ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vary by">
            <select
              value={singleVary}
              onChange={(e) => setSingleVary(e.target.value as VaryKind)}
              className={inputCls}
            >
              {VARY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          {singleVary === "diaXlen" ? (
            <>
              <Field label="Diameter (mm)">
                <input
                  value={singleDiameter}
                  onChange={(e) => setSingleDiameter(e.target.value)}
                  className={inputCls}
                  placeholder="10"
                />
              </Field>
              <Field label="Length (mm)">
                <input
                  value={singleValue}
                  onChange={(e) => setSingleValue(e.target.value)}
                  className={inputCls}
                  placeholder="180"
                />
              </Field>
            </>
          ) : singleVary === "side" ? (
            <Field label="Side">
              <select
                value={singleValue}
                onChange={(e) => setSingleValue(e.target.value)}
                className={inputCls}
              >
                <option value="">—</option>
                <option value="L">L (Left)</option>
                <option value="R">R (Right)</option>
              </select>
            </Field>
          ) : singleVary === "size" ? (
            <Field label="Size">
              <select
                value={singleValue}
                onChange={(e) => setSingleValue(e.target.value)}
                className={inputCls}
              >
                <option value="">—</option>
                {["S", "M", "L", "XL", "XXL"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label={vaLabel(singleVary)}>
              <input
                value={singleValue}
                onChange={(e) => setSingleValue(e.target.value)}
                className={inputCls}
                placeholder={vaPlaceholder(singleVary)}
              />
            </Field>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Vary by">
              <select
                value={bulkVary}
                onChange={(e) => setBulkVary(e.target.value as VaryKind)}
                className={inputCls}
              >
                {VARY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            {family === "distalFemurLockedPlate" && (
              <Field label="Fixed side">
                <select
                  value={fixedSide}
                  onChange={(e) => setFixedSide(e.target.value as "" | "L" | "R")}
                  className={inputCls}
                >
                  <option value="">—</option>
                  <option value="L">L</option>
                  <option value="R">R</option>
                </select>
              </Field>
            )}
          </div>

          {bulkVary === "diaXlen" ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Diameters (comma-separated)">
                <input
                  value={bulkDiameters}
                  onChange={(e) => setBulkDiameters(e.target.value)}
                  className={inputCls}
                  placeholder="10, 11, 12, 13"
                />
              </Field>
              <Field label="Lengths (comma-separated)">
                <input
                  value={bulkLengths}
                  onChange={(e) => setBulkLengths(e.target.value)}
                  className={inputCls}
                  placeholder="180, 200, 220, 240"
                />
              </Field>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3">
                <Field label="From">
                  <input
                    value={bulkRangeFrom}
                    onChange={(e) => setBulkRangeFrom(e.target.value)}
                    className={inputCls}
                    placeholder="42"
                  />
                </Field>
                <Field label="To">
                  <input
                    value={bulkRangeTo}
                    onChange={(e) => setBulkRangeTo(e.target.value)}
                    className={inputCls}
                    placeholder="54"
                  />
                </Field>
                <Field label="Step">
                  <input
                    value={bulkRangeStep}
                    onChange={(e) => setBulkRangeStep(e.target.value)}
                    className={inputCls}
                    placeholder="1"
                  />
                </Field>
                <Field label="Decimals">
                  <input
                    value={bulkDecimals}
                    onChange={(e) => setBulkDecimals(e.target.value)}
                    className={inputCls}
                    placeholder="0"
                  />
                </Field>
              </div>
              <Field label="…or explicit values (comma-separated, overrides range)">
                <input
                  value={bulkValues}
                  onChange={(e) => setBulkValues(e.target.value)}
                  className={inputCls}
                  placeholder="70, 75, 105, 110, 115, 120"
                />
              </Field>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Stock qty">
          <input
            type="number"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Supplier">
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className={inputCls}
          >
            <option value="">— none —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Preview */}
      <div
        className="rounded-[4px] p-3"
        style={{ backgroundColor: "#f8fafc", border: "1px solid #e5edf5" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: "#273951" }}>
            Preview ({previewSkus.length} SKU{previewSkus.length === 1 ? "" : "s"})
          </span>
        </div>
        {previewSkus.length === 0 ? (
          <p className="text-xs" style={{ color: "#94a3b8" }}>
            Fill in inputs to see generated codes.
          </p>
        ) : (
          <ul className="text-xs font-mono max-h-40 overflow-auto space-y-0.5">
            {previewSkus.map((s) => (
              <li key={s.itemCode} style={{ color: "#0a1628" }}>
                <span style={{ color: "#1a6bb5" }}>{s.itemCode}</span>
                {s.variant && (
                  <span style={{ color: "#94a3b8" }}> — {s.variant}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-sm" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || previewSkus.length === 0}
        className="w-full py-2 text-white rounded-[4px] disabled:opacity-50"
        style={{ backgroundColor: "#1a6bb5" }}
      >
        {submitting
          ? "Saving…"
          : `Add ${previewSkus.length} product${previewSkus.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: "#273951" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function vaLabel(k: VaryKind): string {
  return (
    {
      diameter: "Diameter (mm)",
      length: "Length (mm)",
      holes: "Hole count",
      diaXlen: "—",
      side: "Side",
      size: "Size",
    } as Record<VaryKind, string>
  )[k];
}

function vaPlaceholder(k: VaryKind): string {
  return (
    {
      diameter: "3.5",
      length: "16",
      holes: "5",
      diaXlen: "",
      side: "L",
      size: "M",
    } as Record<VaryKind, string>
  )[k];
}

function parseList(s: string): string[] {
  return s
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}
