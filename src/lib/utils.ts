import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchCryptoPrices(retries = 2): Promise<any> {
    try {
      // 1. Primary: Try the high-redundancy backend proxy (fastest and most reliable)
      const response = await fetch(`/api/market/prices?t=${Date.now()}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Proxy error: ${response.status}`);
    } catch (error) {
      console.warn("Backend proxy offline or rate-limited, attempting direct public API fetch...");
      
      // 2. Secondary: Direct public API fetch (CoinCap - extremely reliable)
      try {
        const coincapResponse = await fetch("https://api.coincap.io/v2/assets?limit=100");
        if (coincapResponse.ok) {
          const json = await coincapResponse.json();
          const prices: any = {};
          const symbolMap: Record<string, string> = {
        'bitcoin': 'btc', 'ethereum': 'eth', 'solana': 'sol', 'cardano': 'ada', 'xrp': 'xrp',
        'binance-coin': 'bnb', 'dogecoin': 'doge', 'chainlink': 'link', 'polkadot': 'dot',
        'polygon': 'matic', 'avalanche': 'avax', 'shiba-inu': 'shib', 'tron': 'trx',
        'litecoin': 'ltc', 'near-protocol': 'near', 'uniswap': 'uni', 'algorand': 'algo',
        'cosmos': 'atom', 'internet-computer': 'icp', 'stellar': 'xlm', 'stacks': 'stx',
        'filecoin': 'fil', 'lido-dao': 'ldo', 'hedera-hashgraph': 'hbar', 'arbitrum': 'arb'
      };
      json.data.forEach((asset: any) => {
        const sym = symbolMap[asset.id];
        if (sym) {
          prices[sym] = { 
            usd: parseFloat(asset.priceUsd), 
            change: parseFloat(asset.changePercent24Hr),
            source: 'fallback-coincap'
          };
        }
      });
      if (prices.btc) return prices;
    }
  } catch (e) {
    console.error("CoinCap fallback failed:", e);
  }

  // 3. Last Resort: BitPay for pure BTC/ETH prices
  try {
    const bpResponse = await fetch("https://bitpay.com/api/rates");
    if (bpResponse.ok) {
       const data = await bpResponse.json();
       const btc = data.find((r: any) => r.code === 'USD')?.rate;
       if (btc) {
         return {
           btc: { usd: btc, change: 0, source: 'fallback-bitpay' },
           eth: { usd: btc / 30, change: 0, source: 'fallback-bitpay' }
         };
       }
    }
  } catch (e) {
    console.error("BitPay fallback failed:", e);
  }

      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchCryptoPrices(retries - 1);
      }
      return null;
    }
  }
  
  export async function fetchBtcPrice(retries = 2): Promise<any> {
    try {
      const response = await fetch(`/api/market/btc-price?t=${Date.now()}`);
      if (!response.ok)
        throw new Error(`Proxy error: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("fetchBtcPrice proxy failed, attempting direct fetch...", error);
      try {
        const directResponse = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        if (directResponse.ok) {
          const data = await directResponse.json();
          return { price: parseFloat(data.price), change: 0.1 }; // 0.1 change as fallback
        }
      } catch (directError) {
        console.error("Direct BTC fetch failed:", directError);
      }

      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchBtcPrice(retries - 1);
      }
      return null;
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
