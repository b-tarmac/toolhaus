import { browser } from "./browser";

const STORAGE_KEYS = {
  IS_PRO: "toolhaus_is_pro",
  PRO_CHECKED_AT: "toolhaus_pro_checked_at",
  AUTH_TOKEN: "toolhaus_auth_token",
  PINNED_TOOLS: "toolhaus_pinned_tools",
} as const;

const PRO_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getIsPro(): Promise<boolean> {
  try {
    const result = await browser.storage.sync.get([
      STORAGE_KEYS.IS_PRO,
      STORAGE_KEYS.PRO_CHECKED_AT,
    ]);
    const isPro = result[STORAGE_KEYS.IS_PRO] === true;
    const checkedAt = result[STORAGE_KEYS.PRO_CHECKED_AT] as number | undefined;
    if (checkedAt && Date.now() - checkedAt > PRO_CACHE_TTL_MS) {
      return false;
    }
    return isPro;
  } catch {
    return false;
  }
}

export async function setIsPro(isPro: boolean): Promise<void> {
  await browser.storage.sync.set({
    [STORAGE_KEYS.IS_PRO]: isPro,
    [STORAGE_KEYS.PRO_CHECKED_AT]: Date.now(),
  });
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const result = await browser.storage.sync.get(STORAGE_KEYS.AUTH_TOKEN);
    return (result[STORAGE_KEYS.AUTH_TOKEN] as string) || null;
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string | null): Promise<void> {
  if (token) {
    await browser.storage.sync.set({ [STORAGE_KEYS.AUTH_TOKEN]: token });
  } else {
    await browser.storage.sync.remove(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export async function getPinnedTools(): Promise<string[]> {
  try {
    const result = await browser.storage.sync.get(STORAGE_KEYS.PINNED_TOOLS);
    const pinned = result[STORAGE_KEYS.PINNED_TOOLS];
    return Array.isArray(pinned) ? pinned : [];
  } catch {
    return [];
  }
}

export async function setPinnedTools(tools: string[]): Promise<void> {
  await browser.storage.sync.set({ [STORAGE_KEYS.PINNED_TOOLS]: tools });
}
