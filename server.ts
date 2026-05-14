import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { UAParser } from "ua-parser-js";

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login notification requests per windowMs
  message: { error: "Too many login attempts from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // IP trust setting for proxies
  app.set('trust proxy', 1);

  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false,
    xFrameOptions: false,
    crossOriginResourcePolicy: false,
  }));
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "2.1.2", timestamp: new Date().toISOString() });
  });

  const fetchWithTimeout = async (url: string, options: any = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  let globalMarketDataCache: any = null;
  let lastMarketDataFetch = 0;
  let isFetching = false;

  // Background fetch logic to keep data fresh
  const updateMarketData = async () => {
    if (isFetching) return;
    isFetching = true;
    try {
      // First try Binance
      const symbols = [
        "BTCUSDT", "ETHUSDT", "SOLUSDT", "ADAUSDT", "XRPUSDT", 
        "BNBUSDT", "DOGEUSDT", "LINKUSDT", "DOTUSDT", "MATICUSDT",
        "AVAXUSDT", "SHIBUSDT", "TRXUSDT", "LTCUSDT", "NEARUSDT",
        "UNIUSDT", "ALGOUSDT", "ATOMUSDT", "ICPUSDT", "XLMUSDT",
        "STXUSDT", "FILUSDT", "LDOUSDT", "HBARUSDT", "ARBUSDT"
      ];
      const encodedSymbols = encodeURIComponent(JSON.stringify(symbols));
      
      let prices: any = null;
      let success = false;
      const endpoints = [
        "https://api.binance.com",
        "https://api1.binance.com"
      ];
      
      for (const baseUrl of endpoints) {
        try {
          const response = await fetchWithTimeout(`${baseUrl}/api/v3/ticker/24hr?symbols=${encodedSymbols}`, {}, 3000);
          if (response.ok) {
            const data = await response.json();
            prices = {};
            data.forEach((item: any) => {
              const sym = item.symbol.replace('USDT', '').toLowerCase();
              prices[sym] = {
                usd: parseFloat(item.lastPrice),
                change: parseFloat(item.priceChangePercent)
              };
            });
            success = true;
            break;
          }
        } catch (e) {}
      }

      if (!success) {
        // Fallback to CoinCap
        const response = await fetchWithTimeout("https://api.coincap.io/v2/assets?limit=100", {}, 5000);
        if (response.ok) {
          const json = await response.json();
          prices = {};
          const symbolMap: Record<string, string> = {
            'bitcoin': 'btc', 'ethereum': 'eth', 'solana': 'sol', 'cardano': 'ada', 'xrp': 'xrp',
            'binance-coin': 'bnb', 'dogecoin': 'doge', 'chainlink': 'link', 'polkadot': 'dot',
            'polygon': 'matic', 'avalanche': 'avax', 'shiba-inu': 'shib', 'tron': 'trx'
          };
          json.data.forEach((asset: any) => {
            const sym = symbolMap[asset.id];
            if (sym) {
              prices[sym] = { usd: parseFloat(asset.priceUsd), change: parseFloat(asset.changePercent24Hr) };
            }
          });
          success = true;
        }
      }

      if (success && prices && prices.btc && prices.btc.usd > 0) {
        globalMarketDataCache = prices;
        lastMarketDataFetch = Date.now();
      }
    } catch (err) {
      console.error("Market update background fetch error:", err);
    } finally {
      isFetching = false;
    }
  };

  // Perform initial fetch 
  updateMarketData();
  // Auto-refresh every 5 seconds in the background for "live" feel
  setInterval(updateMarketData, 5000);

  // Real Crypto Prices API from multiple sources for high reliability
  app.get("/api/market/prices", async (req, res) => {
    if (globalMarketDataCache && Date.now() - lastMarketDataFetch < 7000) {
      return res.json(globalMarketDataCache);
    }
    
    // If cache is empty or stale, and we aren't already fetching, fetch now
    if (!isFetching) {
      await updateMarketData();
    }
    
    // Fallbacks if everything absolutely fails
    if (!globalMarketDataCache) {
      try {
        const bpResponse = await fetchWithTimeout('https://bitpay.com/api/rates', {}, 5000);
        const bpData = await bpResponse.json();
        const btc = bpData.find((r: any) => r.code === 'USD')?.rate;
        if (btc) {
          return res.json({
            btc: { usd: btc, change: 0.1 },
            eth: { usd: btc / 30, change: 0.1 }
          });
        }
      } catch (e) {
        return res.status(503).json({ error: "Market data service unavailable" });
      }
    }
    
    return res.json(globalMarketDataCache || { error: "No data" });
  });

  app.get("/api/market/btc-price", async (req, res) => {
    try {
      const response = await fetchWithTimeout('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', {}, 5000);
      if (response.ok) {
        const data = await response.json();
        return res.json({ usd: parseFloat(data.price) });
      }
      throw new Error("Binance failed");
    } catch (error) {
      try {
        const response = await fetchWithTimeout('https://api.coindesk.com/v1/bpi/currentprice.json', {}, 5000);
        const data = await response.json();
        res.json({ usd: data.bpi.USD.rate_float });
      } catch (e) {
        res.status(503).json({ error: "BTC price unavailable" });
      }
    }
  });

  // Login Notification Route
  app.post("/api/auth/login-notification", loginLimiter, async (req, res) => {
    const { email, time, date, userAgent, sendEmail = true } = req.body;
    
    // 1. IP Detection & Geolocation
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    let location = 'Unknown Location';
    let geoLocationData: any = {};
    
    try {
      const clientIp = typeof ip === 'string' ? ip.split(',')[0].trim() : String(ip);
      if (clientIp !== 'Unknown IP' && clientIp !== '::1' && clientIp !== '127.0.0.1') {
        const geoRes = await fetchWithTimeout(`https://ipapi.co/${clientIp}/json/`, {}, 3000);
        if (geoRes.ok) {
          geoLocationData = await geoRes.json();
          if (!geoLocationData.error) {
            location = `${geoLocationData.city || 'Unknown City'}, ${geoLocationData.region || 'Unknown Region'}, ${geoLocationData.country_name || 'Unknown Country'}`;
          }
        }
      }
    } catch (err) {
      console.warn('Geolocation fetch failed:', err);
    }

    // 2. UA Parsing
    const parser = new UAParser(userAgent || req.headers['user-agent'] || '');
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();
    
    const browserInfo = `${browser.name || 'Unknown Browser'} ${browser.version || ''}`.trim();
    const osInfo = `${os.name || 'Unknown OS'} ${os.version || ''}`.trim();
    const deviceInfo = `${device.vendor || ''} ${device.model || 'Desktop/Laptop'}`.trim();

    if (sendEmail) {
      if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured. Skipping email notification.");
        return res.json({ success: true, ip, location, browser: browserInfo, os: osInfo, emailSent: false, reason: "No API Key" });
      }

      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const subject = "Security Alert: New Login to Your Account";
        const htmlBody = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #d9534f;">New Login Detected</h2>
            <p>We detected a new login to your account. Here are the details:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 8px;"><strong>Time:</strong> ${time}</li>
                <li style="margin-bottom: 8px;"><strong>Date:</strong> ${date}</li>
                <li style="margin-bottom: 8px;"><strong>IP Address:</strong> ${ip}</li>
                <li style="margin-bottom: 8px;"><strong>Location:</strong> ${location}</li>
                <li style="margin-bottom: 8px;"><strong>Browser:</strong> ${browserInfo}</li>
                <li style="margin-bottom: 8px;"><strong>Operating System:</strong> ${osInfo}</li>
                <li style="margin-bottom: 8px;"><strong>Device:</strong> ${deviceInfo}</li>
              </ul>
            </div>
            <p>If this was you, you can safely ignore this email. We have registered this device to your trusted sessions.</p>
            <p><strong>If this was not you:</strong> Please quickly change your password and add additional security measures to your account such as 2FA Authenticator.</p>
          </div>
        `;

        await resend.emails.send({
          from: "Security <security@resend.dev>", // replace with verified domain if available
          to: [email],
          subject,
          html: htmlBody,
        });

        return res.json({ success: true, ip, location, browser: browserInfo, os: osInfo, emailSent: true });
      } catch (error) {
        console.error("Failed to send login notification:", error);
        return res.status(500).json({ error: "Failed to send email" });
      }
    } else {
      return res.json({ success: true, ip, location, browser: browserInfo, os: osInfo, emailSent: false });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server v2.1.2 running on http://localhost:${PORT}`);
    console.log(`Live market data active at 5s intervals`);
  });
}

startServer();
