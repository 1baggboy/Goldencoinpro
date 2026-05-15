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
    const clientIp = typeof ip === 'string' ? ip.split(',')[0].trim() : String(ip);
    let location = 'Unknown Location';
    
    try {
      if (clientIp !== 'Unknown IP' && clientIp !== '::1' && clientIp !== '127.0.0.1') {
        const geoRes = await fetchWithTimeout(`https://ipapi.co/${clientIp}/json/`, {}, 3000);
        if (geoRes.ok) {
          const geoLocationData = await geoRes.json();
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
        return res.json({ success: true, ip: clientIp, location, browser: browserInfo, os: osInfo, emailSent: false, reason: "No API Key" });
      }

      if (!email) {
        return res.status(400).json({ error: "Email recipient is required", success: false });
      }

      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        console.log(`[Resend] Attempting to send login notification to: ${email}`);
        
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "security@goldencoin.live",
          to: [email],
          replyTo: "support@goldencoin.live",
          subject: `Security Alert: New Login to Golden Coin from ${location || clientIp}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #C9A96E; padding: 20px; text-align: center;">
                <h1 style="color: #0B0B0B; margin: 0; font-size: 24px;">Security Notification</h1>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #d9534f; margin-top: 0;">New Device Login Detected</h2>
                <p>Hello,</p>
                <p>We detected a successful login to your Golden Coin account from a device we don't recognize.</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #eee;">
                  <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Login Details:</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 5px 0; color: #666; width: 120px;"><strong>Date:</strong></td><td style="padding: 5px 0;">${date}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666;"><strong>Time:</strong></td><td style="padding: 5px 0;">${time}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666;"><strong>Location:</strong></td><td style="padding: 5px 0;">${location}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666;"><strong>IP Address:</strong></td><td style="padding: 5px 0;">${clientIp}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666;"><strong>Device:</strong></td><td style="padding: 5px 0;">${deviceInfo}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666;"><strong>Browser:</strong></td><td style="padding: 5px 0;">${browserInfo}</td></tr>
                    <tr><td style="padding: 5px 0; color: #666;"><strong>OS:</strong></td><td style="padding: 5px 0;">${osInfo}</td></tr>
                  </table>
                </div>

                <p style="font-weight: bold; color: #333;">Was this you?</p>
                <p>If this was you, you can safely ignore this message. This device has been added to your trusted devices list.</p>
                
                <p style="font-weight: bold; color: #d9534f;">If this WAS NOT you:</p>
                <p>Your account may be compromised. Please take these steps immediately:</p>
                <ol>
                  <li style="margin-bottom: 10px;">Change your password immediately.</li>
                  <li style="margin-bottom: 10px;">Enable Two-Factor Authentication (2FA) if not already active.</li>
                  <li style="margin-bottom: 10px;">Review your trusted devices in your profile settings.</li>
                </ol>
                
                <div style="margin-top: 30px; text-align: center;">
                  <a href="https://goldencoin.live/profile" style="background-color: #C9A96E; color: #0B0B0B; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Secure My Account</a>
                </div>
              </div>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                <p>&copy; ${new Date().getFullYear()} Golden Coin Ltd. All rights reserved.</p>
                <p>This is an automated security notification. Please do not reply directly to this email.</p>
              </div>
            </div>
          `,
        });

        if (emailError) {
          console.error("[Resend Error]:", JSON.stringify(emailError, null, 2));
          return res.status(500).json({ 
            error: "Resend API Error", 
            details: emailError.message,
            code: emailError.name,
            success: false,
            tip: "If your domain goldencoin.live is NOT yet fully verified in the Resend dashboard, you can ONLY send emails to the address you signed up with (lookuptoadams@gmail.com). Check Domain -> DNS Records in Resend."
          });
        }

        console.log(`[Resend Success]: Sent message ${emailData?.id}`);
        return res.json({ success: true, ip: clientIp, location, browser: browserInfo, os: osInfo, emailSent: true, messageId: emailData?.id });
      } catch (error) {
        console.error("Critical error in email route:", error);
        return res.status(500).json({ error: "Server error during email sending", success: false });
      }
    } else {
      return res.json({ success: true, ip: clientIp, location, browser: browserInfo, os: osInfo, emailSent: false });
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
