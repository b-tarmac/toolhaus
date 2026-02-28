import { useState, useEffect } from "react";
import { browser } from "../src/lib/browser";
import { ToolPicker } from "./components/ToolPicker";
import { MiniTool } from "./components/MiniTool";
import { ProBanner } from "./components/ProBanner";
import { useProStatus } from "./hooks/useProStatus";
import type { PopupToolId } from "./types";

const FREE_TOOLS: PopupToolId[] = [
  "json-formatter",
  "base64-tool",
  "timestamp-converter",
];

const PRO_TOOLS: PopupToolId[] = ["jwt-decoder", "hash-generator"];

const ALL_TOOLS: PopupToolId[] = [...FREE_TOOLS, ...PRO_TOOLS];

export default function App() {
  const { isPro, refresh } = useProStatus();
  const [activeTool, setActiveTool] = useState<PopupToolId>("json-formatter");

  const availableTools = isPro === true ? ALL_TOOLS : FREE_TOOLS;

  useEffect(() => {
    if (activeTool && !availableTools.includes(activeTool)) {
      setActiveTool(availableTools[0]);
    }
  }, [activeTool, availableTools]);

  const handleConnect = () => {
    const callbackUrl = browser.runtime.getURL("auth-callback.html");
    const url = `https://toolhaus.dev/extension-auth?redirect_uri=${encodeURIComponent(callbackUrl)}`;
    browser.tabs.create({ url });
  };

  useEffect(() => {
    const listener = (msg: { type?: string }) => {
      if (msg.type === "PRO_STATUS_UPDATED") {
        refresh();
      }
    };
    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, [refresh]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">🔧</span>
          <span className="app-logo-text">Toolhaus</span>
        </div>
        <ToolPicker
          tools={availableTools}
          activeTool={activeTool}
          onSelect={setActiveTool}
        />
        {isPro === false && <ProBanner onConnect={handleConnect} />}
      </header>
      <main className="app-main">
        <MiniTool toolId={activeTool} />
      </main>
    </div>
  );
}
