import type { PopupToolId } from "../types";
import { TOOL_SHORT_NAMES } from "../types";

interface ToolPickerProps {
  tools: PopupToolId[];
  activeTool: PopupToolId;
  onSelect: (tool: PopupToolId) => void;
}

export function ToolPicker({ tools, activeTool, onSelect }: ToolPickerProps) {
  return (
    <div className="tool-picker">
      {tools.map((tool) => (
        <button
          key={tool}
          type="button"
          className={`tool-picker-btn ${activeTool === tool ? "active" : ""}`}
          onClick={() => onSelect(tool)}
          title={TOOL_SHORT_NAMES[tool]}
        >
          {TOOL_SHORT_NAMES[tool]}
        </button>
      ))}
    </div>
  );
}
