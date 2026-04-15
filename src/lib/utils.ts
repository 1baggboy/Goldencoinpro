import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchCryptoPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (!data.bitcoin) throw new Error('Invalid data format');
    return {
      btc: { usd: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
      eth: { usd: data.ethereum.usd, change: data.ethereum.usd_24h_change },
      sol: { usd: data.solana.usd, change: data.solana.usd_24h_change },
      ada: { usd: data.cardano.usd, change: data.cardano.usd_24h_change }
    };
  } catch (error) {
    console.error("Failed to fetch crypto prices, using fallback:", error);
    return {
      btc: { usd: 65000 + Math.random() * 1000, change: 2.5 },
      eth: { usd: 3500 + Math.random() * 100, change: 1.2 },
      sol: { usd: 140 + Math.random() * 10, change: -0.5 },
      ada: { usd: 0.45 + Math.random() * 0.05, change: 0.8 }
    };
  }
}

export async function fetchBtcPrice() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (!data.bitcoin) throw new Error('Invalid data format');
    return { usd: data.bitcoin.usd };
  } catch (error) {
    console.error("Failed to fetch BTC price, using fallback:", error);
    return { usd: 65000 + Math.random() * 1000 };
  }
}
