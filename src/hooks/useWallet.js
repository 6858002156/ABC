import { useState, useEffect, useCallback } from "react";
import { mockApi } from "@/lib/mockApi";

// Ensures the current user has a wallet record; returns { wallet, loading, refresh, updateBalance }
export function useWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const me = await mockApi.auth.me();
      setWallet(await mockApi.wallet.getOrCreate(me.id));
    } catch (e) {
      console.error("wallet error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const syncWallet = (event) => {
      if (!wallet || event.detail?.created_by_id === wallet.created_by_id || event.detail?.id === wallet.id) {
        setWallet(event.detail);
      }
    };
    globalThis.addEventListener?.("volt-jai-wallet-updated", syncWallet);
    return () => globalThis.removeEventListener?.("volt-jai-wallet-updated", syncWallet);
  }, [wallet?.created_by_id, wallet?.id]);

  const updateBalance = useCallback(async (newBalance) => {
    if (!wallet) return;
    return mockApi.wallet.setBalance(newBalance);
  }, [wallet]);

  return { wallet, loading, refresh, updateBalance };
}
