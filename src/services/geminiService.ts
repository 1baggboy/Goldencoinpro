import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will be limited.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface MarketInsight {
  headline: string;
  insight: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  recommendation: string;
}

export async function getMarketInsight(prices: any): Promise<MarketInsight> {
  const client = getAiClient();
  if (!client) {
    return {
      headline: "Market Stability Observed",
      insight: "Bitcoin continues to lead the market trend with consistent institutional volume across major exchanges.",
      sentiment: "neutral",
      recommendation: "Hold positions and monitor resistance levels."
    };
  }

  const prompt = `You are a professional crypto trading analyst at a high-end institutional desk. Based on these current market prices:
  BTC: $${prices?.btc?.usd} (${prices?.btc?.change}% 24h)
  ETH: $${prices?.eth?.usd} (${prices?.eth?.change}% 24h)
  SOL: $${prices?.sol?.usd} (${prices?.sol?.change}% 24h)

  Provide a sophisticated, institutional-grade market insight. 
  Focus on volume, resistance levels, and macro sentiment.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            insight: { type: "string" },
            sentiment: { type: "string", enum: ["bullish", "bearish", "neutral"] },
            recommendation: { type: "string" }
          },
          required: ["headline", "insight", "sentiment", "recommendation"]
        }
      }
    } as any);

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      headline: "Market Stability Observed",
      insight: "Bitcoin continues to lead the market trend with consistent institutional volume across major exchanges.",
      sentiment: "neutral",
      recommendation: "Hold positions and monitor resistance levels."
    };
  }
}

export async function getSupportResponse(userMessage: string, userContext: any): Promise<string> {
  const client = getAiClient();
  if (!client) {
    return "Our support system is currently initializing. Please check back in a few minutes or contact us via email.";
  }

  const prompt = `You are the Goldencoin AI Support Assistant. Goldencoin is a premium Bitcoin investment and management platform.
  
  User Information:
  - Name: ${userContext?.displayName || 'Guest'}
  - KYC Status: ${userContext?.kycStatus || 'Unknown'}
  - Role: ${userContext?.role || 'User'}
  
  Platform Features:
  1. Deposits: Bitcoin and USD (via bank transfer/gateways).
  2. Investments: Fixed-term cycles (e.g., 20% return after 30 days).
  3. KYC: Mandatory for withdrawals.
  4. Security: 2FA available via TOTP/Authenticator.
  
  User Message: "${userMessage}"
  
  Rules:
  - Be professional, polite, and helpful.
  - If the user asks about investments, explain the fixed cycles.
  - If they report an error like [auth/network-request-failed], tell them it's a connection issue and to check their VPN or internet.
  - Keep the response short (under 3 sentences).
  - Use a "concierge" tone.
  
  Return ONLY the text response.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });
    return response.text || "I'm sorry, I couldn't process that. A human support agent has been notified.";
  } catch (error) {
    console.error("Gemini Support Error:", error);
    return "Our AI assistant is currently stabilizing. Please wait for a human agent to respond.";
  }
}

export interface DailyStrategy {
  title: string;
  strategy: string;
}

export async function getDailyStrategy(userContext: any): Promise<DailyStrategy> {
  const client = getAiClient();
  if (!client) {
    return {
      title: "Diversification is Key",
      strategy: "Our AI suggests maintaining a 70/30 split between BTC and stable assets during high volatility periods to optimize risk-adjusted returns."
    };
  }

  const prompt = `You are an institutional wealth manager. Based on the user's dashboard context:
  - Account Balance: $${userContext?.usdBalance || 0}
  - Trading Balance: ${userContext?.tradingBalanceBtc || 0} BTC
  - Active Investments: ${userContext?.activeInvestmentsCount || 0}
  - Has Recent Transactions: ${userContext?.hasRecentActivity ? 'Yes' : 'No'}
  
  Provide a personalized daily investment strategy to help them comfortably invest for the next 24 hours while managing risks effectively. It should make them feel secure. Provide varied responses so it's not always the same if the context changes slightly over days.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            strategy: { type: "string" }
          },
          required: ["title", "strategy"]
        }
      }
    } as any);

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Strategy Error:", error);
    return {
      title: "Diversification is Key",
      strategy: "Our AI suggests maintaining a 70/30 split between BTC and stable assets during high volatility periods to optimize risk-adjusted returns."
    };
  }
}
