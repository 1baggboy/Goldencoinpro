import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchCryptoPrices(retries = 2): Promise<any> {
    try {
      const response = await fetch(`/api/market/prices?t=${Date.now()}`);
      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchCryptoPrices(retries - 1);
      }
      // Log as a warning instead of error to reduce alarm if background refresh fails
      console.warn("fetchCryptoPrices background update failed:", error);
      return null;
    }
  }
  
  export async function fetchBtcPrice(retries = 2): Promise<any> {
    try {
      const response = await fetch(`/api/market/btc-price?t=${Date.now()}`);
      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchBtcPrice(retries - 1);
      }
      console.warn("fetchBtcPrice background update failed:", error);
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
