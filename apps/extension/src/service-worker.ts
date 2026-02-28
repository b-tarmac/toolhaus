import { CONTEXT_MENU_TOOLS } from "@toolhaus/tool-sdk";
import { browser } from "./lib/browser";

const TOOLHAUS_BASE = "https://toolhaus.dev";

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "toolhaus-root",
    title: "Toolhaus",
    contexts: ["selection"],
  });

  const menuItems: Array<{ id: string; title: string }> = [
    { id: "decode-base64", title: "Decode as Base64" },
    { id: "convert-timestamp", title: "Convert Timestamp" },
    { id: "format-json", title: "Format as JSON" },
    { id: "count-tokens", title: "Count LLM Tokens" },
    { id: "decode-jwt", title: "Decode JWT" },
    { id: "convert-color", title: "Convert Color" },
    { id: "hash-sha256", title: "Hash (SHA-256)" },
  ];

  menuItems.forEach((item) =>
    browser.contextMenus.create({
      ...item,
      parentId: "toolhaus-root",
      contexts: ["selection"],
    })
  );
});

browser.contextMenus.onClicked.addListener((info) => {
  const slug = CONTEXT_MENU_TOOLS[info.menuItemId];
  if (!slug) return;

  const selection = info.selectionText ?? "";
  const url = `${TOOLHAUS_BASE}/tools/${slug}?input=${encodeURIComponent(selection)}`;

  browser.tabs.create({ url });
});
