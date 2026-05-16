import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodeCron from "node-cron";

// Routers
import { authRouter } from "./src/server/routes/authRoutes";
import { userRouter } from "./src/server/routes/userRoutes";
import { transactionRouter } from "./src/server/routes/transactionRoutes";
import { investmentRouter } from "./src/server/routes/investmentRoutes";
import { supportRouter } from "./src/server/routes/supportRoutes";
import { adminRouter } from "./src/server/routes/adminRoutes";
import { db } from "./src/server/lib/firebase";
import { InvestmentService } from "./src/server/services/InvestmentService";

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please try again later." }
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.set('trust proxy', 1);
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false,
    xFrameOptions: false,
    crossOriginResourcePolicy: false,
  }));
  app.use(express.json());

  // --- MARKET DATA LOGIC (PRESERVED) ---
  let globalMarketDataCache: any = null;
  let lastMarketDataFetch = 0;
  let isFetchingMarket = false;

  const updateMarketData = async () => {
    if (isFetchingMarket) return;
    isFetchingMarket = true;
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbols=" + encodeURIComponent(JSON.stringify(["BTCUSDT", "ETHUSDT", "SOLUSDT"])));
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const prices: any = {};
          data.forEach((item: any) => {
            const sym = item.symbol.replace('USDT', '').toLowerCase();
            prices[sym] = { usd: parseFloat(item.lastPrice), change: parseFloat(item.priceChangePercent) };
          });
          globalMarketDataCache = prices;
          lastMarketDataFetch = Date.now();
        }
      }
    } catch (e) {
      console.warn("Market fetch failed");
    } finally {
      isFetchingMarket = false;
    }
  };
  updateMarketData();
  setInterval(updateMarketData, 30000);

  app.get("/api/market/prices", (req, res) => res.json(globalMarketDataCache || {}));
  
  // Cron Jobs
  nodeCron.schedule('0 * * * *', () => {
    console.log('[Cron] Running investment maturity check...');
    InvestmentService.processMaturity().catch(console.error);
  });

  // Mount API Routers
  app.use("/api/auth", globalLimiter, authRouter);
  app.use("/api/user", globalLimiter, userRouter);
  app.use("/api/transactions", globalLimiter, transactionRouter);
  app.use("/api/investments", globalLimiter, investmentRouter);
  app.use("/api/support", globalLimiter, supportRouter);
  app.use("/api/admin", globalLimiter, adminRouter);

  // Newsletter
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
      await db.collection("newsletters").add({ email, isSubscribed: true, createdAt: new Date() });
      res.json({ success: true, message: "Subscribed successfully" });
    } catch(err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Backend running on http://localhost:${PORT}`);
  });
}

startServer();
