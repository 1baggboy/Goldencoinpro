import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchCryptoPrices } from "./lib/utils";
import { APP_CONFIG } from "./config";

interface PriceContextType {
  prices: any;
  loading: boolean;
  error: string | null;
  refreshPrices: () => Promise<void>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<any>({
    btc: { usd: 0, change: 0 },
    eth: { usd: 0, change: 0 },
    sol: { usd: 0, change: 0 },
    ada: { usd: 0, change: 0 },
    xrp: { usd: 0, change: 0 },
    bnb: { usd: 0, change: 0 },
    doge: { usd: 0, change: 0 },
    link: { usd: 0, change: 0 },
    dot: { usd: 0, change: 0 },
    matic: { usd: 0, change: 0 },
    avax: { usd: 0, change: 0 },
    shib: { usd: 0, change: 0 },
    trx: { usd: 0, change: 0 },
    ltc: { usd: 0, change: 0 },
    near: { usd: 0, change: 0 },
    uni: { usd: 0, change: 0 },
    algo: { usd: 0, change: 0 },
    atom: { usd: 0, change: 0 },
    icp: { usd: 0, change: 0 },
    xlm: { usd: 0, change: 0 },
    stx: { usd: 0, change: 0 },
    fil: { usd: 0, change: 0 },
    ldo: { usd: 0, change: 0 },
    hbar: { usd: 0, change: 0 },
    arb: { usd: 0, change: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPrices = async () => {
    try {
      const data = await fetchCryptoPrices();
      if (data && typeof data === 'object' && data.btc) {
        setPrices(data);
        setError(null);
      }
    } catch (err) {
      // Background logging is already handled in utils.ts
      // Only set error if we have no valid prices at all
      if (!prices || !prices.btc || !prices.btc.usd) {
        setError("Market data temporarily unavailable.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPrices();
    // Faster updates (10 seconds) for a more "live" feel
    const interval = setInterval(refreshPrices, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <PriceContext.Provider value={{ prices, loading, error, refreshPrices }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePrices = () => {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error("usePrices must be used within a PriceProvider");
  }
  return context;
};
