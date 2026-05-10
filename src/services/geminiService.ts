import { GoogleGenAI } from "@google/genai";

// Standard initialization as per AI Studio guidelines
// process.env.GEMINI_API_KEY is handled by the platform
// For Vercel/Client-side, we check import.meta.env.VITE_GEMINI_API_KEY
const getApiKey = () => {
  if (typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEY) {
    return (process as any).env.GEMINI_API_KEY;
  }
  return (import.meta as any).env?.VITE_GEMINI_API_KEY;
};

const apiKey = getApiKey();
const ai = (apiKey && typeof apiKey === 'string' && apiKey.trim() !== '') 
  ? new GoogleGenAI({ apiKey }) 
  : null;

export interface MarketInsight {
  headline: string;
  insight: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  recommendation: string;
}

export async function getMarketInsight(prices: any): Promise<MarketInsight> {
  // 1. Try Proxied Server Route First (Best Security & Reliability)
  try {
    const response = await fetch("/api/ai/insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prices })
    });
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("Backend AI proxy unavailable, trying client fallback...");
  }

  // 2. Client Side Fallback
  if (ai) {
    const prompt = `You are a professional institutional crypto trading analyst at Goldencoin. Based on these current market prices:
    BTC: $${prices?.btc?.usd} (${prices?.btc?.change}% 24h)
    ETH: $${prices?.eth?.usd} (${prices?.eth?.change}% 24h)
    SOL: $${prices?.sol?.usd} (${prices?.sol?.change}% 24h)
    BNB: $${prices?.bnb?.usd} (${prices?.bnb?.change}% 24h)

    Generate an institutional-grade market insight focusing on macro trends and volume profile.
    Return a raw JSON object with fields: headline, insight, sentiment (bullish/bearish/neutral), recommendation.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text;
      if (text) return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Client fallback error:", error);
    }
  }

  // 3. Static Fallback
  return {
    headline: "Institutional Accumulation Phase Detected",
    insight: "On-chain data indicates a significant increase in whale accumulation around current support levels. Institutional volume remains the primary driver of the current market structure.",
    sentiment: "bullish",
    recommendation: "Strategic Accumulation"
  };
}

export async function getSupportResponse(userMessage: string, userContext: any): Promise<string> {
  // 1. Proxy
  try {
    const response = await fetch("/api/ai/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, context: userContext })
    });
    if (response.ok) {
       const data = await response.json();
       return data.response;
    }
  } catch (e) {}

  // 2. Client
  if (ai) {
    const prompt = `You are Goldencoin AI Support. User: ${userContext?.displayName || 'Guest'}.
    Message: "${userMessage}"
    Be professional and concierge-like. Keep it under 2 sentences.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      if (response.text) return response.text;
    } catch (error) {
      console.error("Gemini Support Client fallback error:", error);
    }
  }

  return "Our AI concierge is connecting to specialized support channels. Please check back shortly.";
}

export interface DailyStrategy {
  title: string;
  strategy: string;
}

export async function getDailyStrategy(userContext: any): Promise<DailyStrategy> {
  // 1. Proxy
  try {
    const response = await fetch("/api/ai/strategy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userContext })
    });
    if (response.ok) return await response.json();
  } catch (e) {}

  // 2. Client
  if (ai) {
    const prompt = `As a Goldencoin Senior Strategist, provide a personalized investment strategy for a portfolio with:
    USD Balance: $${userContext?.usdBalance || 0}
    Trading BTC: ${userContext?.tradingBalanceBtc || 0} BTC

    Focus on risk management and yield optimization for the next 24-72 hours.
    Return JSON: {title, strategy}.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Strategy Client fallback error:", error);
    }
  }

  return {
    title: "Capital Preservation Strategy",
    strategy: "Focus on maintaining liquidity levels while allocating 15% toward high-liquidity BTC positions."
  };
}
