import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchCryptoPrices } from "./lib/utils";
import { APP_CONFIG } from "./config";

export interface PriceAlert {
  id: string;
  asset: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  soundProfile?: 'default' | 'chime' | 'bell' | 'synthetic';
  history: { timestamp: number; price: number }[];
}

interface PriceContextType {
  prices: any;
  loading: boolean;
  error: string | null;
  refreshPrices: () => Promise<void>;
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'isActive' | 'history'>) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  pulsingAlertIds: string[];
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

const CACHE_KEY = "goldencoin_market_prices";
const ALERTS_CACHE_KEY = "goldencoin_price_alerts";

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    const cached = localStorage.getItem(ALERTS_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });

  // Try to load cached prices first for instant initialization
  const [prices, setPrices] = useState<any>(() => {
    try {
      const sessionCached = sessionStorage.getItem("goldencoin_market_prices_session");
      if (sessionCached) {
        return JSON.parse(sessionCached);
      }
    } catch (e) {
      console.error("Failed to parse sessionStorage prices", e);
    }
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached prices", e);
      }
    }
    return {
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
    };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pulsingAlertIds, setPulsingAlertIds] = useState<string[]>([]);
  
  const addAlert = (alert: Omit<PriceAlert, 'id' | 'isActive' | 'history'>) => {
    const newAlert = { ...alert, id: Date.now().toString(), isActive: true, history: [] };
    const newAlerts = [...alerts, newAlert];
    setAlerts(newAlerts);
    localStorage.setItem(ALERTS_CACHE_KEY, JSON.stringify(newAlerts));
  };

  const removeAlert = (id: string) => {
    const newAlerts = alerts.filter(a => a.id !== id);
    setAlerts(newAlerts);
    localStorage.setItem(ALERTS_CACHE_KEY, JSON.stringify(newAlerts));
  };

  const toggleAlert = (id: string) => {
    const newAlerts = alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
    setAlerts(newAlerts);
    localStorage.setItem(ALERTS_CACHE_KEY, JSON.stringify(newAlerts));
  };

  const checkAlerts = (currentPrices: any) => {
    if (!currentPrices) return;
    
    let alertsUpdated = false;
    const updatedAlerts = alerts.map(alert => {
      if (!alert.isActive) return alert;

      const currentPrice = currentPrices[alert.asset.toLowerCase()]?.usd;
      if (!currentPrice) return alert;

      let triggered = false;
      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        triggered = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        alertsUpdated = true;
        
        // Pulse effect
        setPulsingAlertIds(prev => [...prev, alert.id]);
        setTimeout(() => {
            setPulsingAlertIds(prev => prev.filter(id => id !== alert.id));
        }, 3000);
        
        // Play synthesized sound based on profile
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          if (alert.soundProfile === 'chime') {
             osc.type = 'sine';
             osc.frequency.setValueAtTime(880, ctx.currentTime);
             gain.gain.setValueAtTime(0.5, ctx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
          } else if (alert.soundProfile === 'bell') {
             osc.type = 'triangle';
             osc.frequency.setValueAtTime(1046, ctx.currentTime);
             gain.gain.setValueAtTime(0.5, ctx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
          } else if (alert.soundProfile === 'synthetic') {
             osc.type = 'square';
             osc.frequency.setValueAtTime(440, ctx.currentTime);
             osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
             gain.gain.setValueAtTime(0.2, ctx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          } else { // default
             osc.type = 'sine';
             osc.frequency.setValueAtTime(440, ctx.currentTime);
             gain.gain.setValueAtTime(0.3, ctx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          }
          osc.start();
          osc.stop(ctx.currentTime + 2);
        } catch (e) {
          console.warn('AudioContext not supported or blocked', e);
        }

        // Notify natively
        if (Notification.permission === 'granted') {
          new Notification('Golden Coin Alert', {
            body: `${alert.asset.toUpperCase()} is ${alert.condition} $${alert.targetPrice} (Currently $${currentPrice})`
          });
        } else {
          window.alert(`${alert.asset.toUpperCase()} price has crossed $${alert.targetPrice} (Currently $${currentPrice})`);
        }
        
        return { 
            ...alert, 
            isActive: false, 
            history: [...alert.history, { timestamp: Date.now(), price: currentPrice }] 
        };
      }
      return alert;
    });

    if (alertsUpdated) {
      setAlerts(updatedAlerts);
      localStorage.setItem(ALERTS_CACHE_KEY, JSON.stringify(updatedAlerts));
    }
  };

  const refreshPrices = async () => {
    try {
      const data = await fetchCryptoPrices();
      if (data && typeof data === 'object' && data.btc) {
        setPrices((prevPrices: any) => {
          const newPrices = { ...data };
          if (prevPrices) {
            Object.keys(newPrices).forEach(key => {
              if (prevPrices[key] && newPrices[key].usd !== prevPrices[key].usd) {
                newPrices[key].direction = newPrices[key].usd > prevPrices[key].usd ? 'up' : 'down';
              } else if (prevPrices[key]) {
                newPrices[key].direction = prevPrices[key].direction;
              }
            });
          }
          localStorage.setItem(CACHE_KEY, JSON.stringify(newPrices));
          try {
            sessionStorage.setItem("goldencoin_market_prices_session", JSON.stringify(newPrices));
            sessionStorage.setItem("goldencoin_market_prices_timestamp", Date.now().toString());
          } catch (e) {
            console.error("Failed to write to sessionStorage", e);
          }
          return newPrices;
        });
        setError(null);
        checkAlerts(data);
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
    // Request notification permission if needed
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Check if we have recent valid prices in sessionStorage
    let shouldFetchImmediately = true;
    try {
      const sessionCached = sessionStorage.getItem("goldencoin_market_prices_session");
      const sessionTime = sessionStorage.getItem("goldencoin_market_prices_timestamp");
      if (sessionCached && sessionTime) {
        const elapsed = Date.now() - Number(sessionTime);
        // Skip automatic immediate fetch on render/page refresh if caching is fresh (under 15s)
        if (elapsed < 15000) {
          shouldFetchImmediately = false;
          setLoading(false);
          const parsed = JSON.parse(sessionCached);
          checkAlerts(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to read price session storage", e);
    }
    
    if (shouldFetchImmediately) {
      refreshPrices();
    }
    // Faster updates (5 seconds) for a more "live" feel, synced with backend
    const interval = setInterval(refreshPrices, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <PriceContext.Provider value={{ prices, loading, error, refreshPrices, alerts, addAlert, removeAlert, toggleAlert, pulsingAlertIds }}>
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
