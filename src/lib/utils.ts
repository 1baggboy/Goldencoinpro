import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchCryptoPrices(retries = 2): Promise<any> {
    try {
      const [btc, eth, sol, ada] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT').then(r => r.json()),
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT').then(r => r.json()),
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT').then(r => r.json()),
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ADAUSDT').then(r => r.json())
      ]);
      return {
        btc: { usd: parseFloat(btc.lastPrice), change: parseFloat(btc.priceChangePercent) },
        eth: { usd: parseFloat(eth.lastPrice), change: parseFloat(eth.priceChangePercent) },
        sol: { usd: parseFloat(sol.lastPrice), change: parseFloat(sol.priceChangePercent) },
        ada: { usd: parseFloat(ada.lastPrice), change: parseFloat(ada.priceChangePercent) }
      };
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchCryptoPrices(retries - 1);
      }
      // Fallback
      return {
        btc: { usd: 65000, change: 0 },
        eth: { usd: 3500, change: 0 },
        sol: { usd: 150, change: 0 },
        ada: { usd: 0.5, change: 0 }
      };
    }
  }
  
  export async function fetchBtcPrice(retries = 2): Promise<any> {
    try {
      const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
      if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
      const data = await response.json();
      if (!data.bpi || !data.bpi.USD) throw new Error('Invalid data format');
      return { usd: parseFloat(data.bpi.USD.rate_float) };
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchBtcPrice(retries - 1);
      }
      return { usd: 65000 };
    }
  }

export const generateReferralCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
