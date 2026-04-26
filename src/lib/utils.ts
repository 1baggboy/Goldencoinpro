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
    console.error("Failed to fetch crypto prices:", error instanceof Error ? error.message : error);
    throw error;
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
    console.error("Failed to fetch BTC price:", error instanceof Error ? error.message : error);
    throw error;
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
