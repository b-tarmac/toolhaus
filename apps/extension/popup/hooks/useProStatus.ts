import { useState, useEffect, useCallback } from "react";
import { getIsPro, getAuthToken, setIsPro } from "../../src/lib/storage";

const API_BASE = "https://toolhaus.dev";

export function useProStatus() {
  const [isPro, setIsProState] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    const token = await getAuthToken();

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/api/pro/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const pro = data.isPro === true;
        await setIsPro(pro);
        setIsProState(pro);
        return;
      } catch {
        // fall through to cached
      }
    }

    const cached = await getIsPro();
    setIsProState(cached);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { isPro, refresh };
}
