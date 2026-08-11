/**
 * Generic CSV Exporter Utility
 */

export function exportToCSV<T extends Record<string, unknown>>(
  filename: string,
  data: T[],
  headers?: { key: keyof T; label: string }[],
): void {
  if (!data || data.length === 0) {
    console.warn("No data available to export.");
    return;
  }

  const columns =
    headers ||
    (Object.keys(data[0]).map((key) => ({
      key: key as keyof T,
      label: key,
    })) as { key: keyof T; label: string }[]);

  const headerRow = columns.map((col) => `"${col.label}"`).join(",");

  const rows = data.map((item) =>
    columns
      .map((col) => {
        const val = item[col.key];
        if (val === null || val === undefined) return '""';
        const formatted = String(val).replace(/"/g, '""');
        return `"${formatted}"`;
      })
      .join(","),
  );

  const csvContent = [headerRow, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
