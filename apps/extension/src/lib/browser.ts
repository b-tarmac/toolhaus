/**
 * Cross-browser extension API.
 * Uses webextension-polyfill for Firefox compatibility (chrome.* → browser.*).
 */
import browser from "webextension-polyfill";

export { browser };
