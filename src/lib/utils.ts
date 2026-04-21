import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchCryptoPrices(retries = 2) {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true');
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
    const data = await response.json();
    if (!data.bitcoin) throw new Error('Invalid data format');
    return {
      btc: { usd: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
      eth: { usd: data.ethereum.usd, change: data.ethereum.usd_24h_change },
      sol: { usd: data.solana.usd, change: data.solana.usd_24h_change },
      ada: { usd: data.cardano.usd, change: data.cardano.usd_24h_change }
    };
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchCryptoPrices(retries - 1);
    }
    console.warn("Using fallback crypto prices due to fetch error:", error instanceof Error ? error.message : error);
    return {
      btc: { usd: 68420.50 + Math.random() * 500, change: 1.25 },
      eth: { usd: 3450.20 + Math.random() * 50, change: -0.42 },
      sol: { usd: 145.75 + Math.random() * 5, change: 3.12 },
      ada: { usd: 0.48 + Math.random() * 0.02, change: 0.15 }
    };
  }
}

export async function fetchBtcPrice(retries = 2) {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
    const data = await response.json();
    if (!data.bitcoin) throw new Error('Invalid data format');
    return { usd: data.bitcoin.usd };
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchBtcPrice(retries - 1);
    }
    console.warn("Using fallback BTC price due to fetch error:", error instanceof Error ? error.message : error);
    return { usd: 68420.50 + Math.random() * 500 };
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
