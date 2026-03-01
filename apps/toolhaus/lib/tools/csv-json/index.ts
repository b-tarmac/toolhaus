import Papa from "papaparse";
import type { ToolResult } from "@portfolio/tool-sdk";

export interface CsvJsonResult extends ToolResult {
  metadata?: {
    rows: Record<string, unknown>[];
    headers: string[];
    delimiter: string;
  };
}

export function csvToJson(
  csv: string,
  delimiter?: string
): CsvJsonResult {
  if (!csv.trim()) {
    return { output: "", isValid: true, metadata: { rows: [], headers: [], delimiter: "," } };
  }

  const result = Papa.parse(csv, {
    header: true,
    delimiter: delimiter || "",
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    return {
      output: "",
      isValid: false,
      error: { message: result.errors[0].message },
    };
  }

  const rows = (result.data as Record<string, unknown>[]) || [];
  const headers = result.meta.fields || (rows[0] ? Object.keys(rows[0]) : []);

  return {
    output: JSON.stringify(rows, null, 2),
    isValid: true,
    metadata: {
      rows,
      headers,
      delimiter: result.meta.delimiter || ",",
    },
  };
}

export function jsonToCsv(
  json: string
): ToolResult {
  if (!json.trim()) return { output: "", isValid: true };

  try {
    const data = JSON.parse(json);
    const arr = Array.isArray(data) ? data : [data];
    const csv = Papa.unparse(arr);
    return { output: csv, isValid: true };
  } catch (e) {
    const err = e as Error;
    return {
      output: "",
      isValid: false,
      error: { message: err.message },
    };
  }
}
