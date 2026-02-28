import { browser } from "./lib/browser";

async function init() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const isPro = params.get("pro") === "true";

  if (token) {
    const { setAuthToken, setIsPro } = await import("./lib/storage");
    await setAuthToken(token);
    await setIsPro(isPro);
  }

  browser.runtime.sendMessage({ type: "PRO_STATUS_UPDATED" });
  window.close();
}

init();
