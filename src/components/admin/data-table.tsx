"use client";

import { useState } from "react";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKeys = [],
  onRowClick,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Filter
  const filtered = search
    ? data.filter((row) =>
        searchKeys.some((key) => {
          const val = row[key];
          return val && String(val).toLowerCase().includes(search.toLowerCase());
        })
      )
    : data;

  // Sort
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortKey] ?? "";
        const bVal = b[sortKey] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div>
      {searchKeys.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 border rounded-[4px] text-sm focus:outline-none focus:border-[#1a6bb5] focus:ring-1 focus:ring-[#1a6bb5] placeholder:text-[#94a3b8]"
            style={{ borderColor: "#e5edf5", color: "#0a1628" }}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-[6px]" style={{ border: "1px solid #e5edf5" }}>
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-4 py-3 font-normal ${col.sortable ? "cursor-pointer select-none" : ""}`}
                  style={{ color: "#273951", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5edf5" }}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map((row, i) => (
                <tr
                  key={i}
                  className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-[#f8fafc]" : ""}`}
                  style={{ borderBottom: "1px solid #e5edf5" }}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3" style={{ color: "#0a1628" }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center" style={{ color: "#64748d" }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs" style={{ color: "#94a3b8" }}>
        {sorted.length} of {data.length} result{data.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
