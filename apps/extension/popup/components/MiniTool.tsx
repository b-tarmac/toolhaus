import { MiniJsonFormatter } from "./tools/MiniJsonFormatter";
import { MiniBase64 } from "./tools/MiniBase64";
import { MiniTimestamp } from "./tools/MiniTimestamp";
import { MiniJwtDecoder } from "./tools/MiniJwtDecoder";
import { MiniHashGenerator } from "./tools/MiniHashGenerator";
import type { PopupToolId } from "../types";

interface MiniToolProps {
  toolId: PopupToolId;
}

const TOOL_COMPONENTS: Record<PopupToolId, React.ComponentType> = {
  "json-formatter": MiniJsonFormatter,
  "base64-tool": MiniBase64,
  "timestamp-converter": MiniTimestamp,
  "jwt-decoder": MiniJwtDecoder,
  "hash-generator": MiniHashGenerator,
};

export function MiniTool({ toolId }: MiniToolProps) {
  const Component = TOOL_COMPONENTS[toolId];
  if (!Component) return null;
  return <Component />;
}
