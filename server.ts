import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development/iframe compatibility
  }));
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Real Crypto Prices API from CoinGecko
  app.get("/api/market/prices", async (req, res) => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true');
      const data = await response.json();
      res.json({
        btc: { usd: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
        eth: { usd: data.ethereum.usd, change: data.ethereum.usd_24h_change },
        sol: { usd: data.solana.usd, change: data.solana.usd_24h_change },
        ada: { usd: data.cardano.usd, change: data.cardano.usd_24h_change }
      });
    } catch (error) {
      // Fallback to mock if API fails
      res.json({
        btc: { usd: 65000 + Math.random() * 1000, change: 2.5 },
        eth: { usd: 3500 + Math.random() * 100, change: 1.2 },
        sol: { usd: 140 + Math.random() * 10, change: -0.5 },
        ada: { usd: 0.45 + Math.random() * 0.05, change: 0.8 }
      });
    }
  });

  app.get("/api/market/btc-price", async (req, res) => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      res.json({ usd: data.bitcoin.usd });
    } catch (error) {
      res.json({ usd: 65000 });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
