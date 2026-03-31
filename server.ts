import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development/iframe compatibility
  }));
  app.use(express.json());

  // Configure Nodemailer
  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: port === 465, // true for 465, false for other ports (e.g., 587)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

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

  // OTP Storage (In-memory for demo)
  const otpStore = new Map<string, { otp: string, expires: number }>();

  app.post("/api/auth/send-otp", async (req, res) => {
    console.log("[OTP] Received request:", req.body);
    const { email } = req.body;
    if (!email) {
        console.log("[OTP] Missing email");
        return res.status(400).json({ error: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 mins

    console.log(`[OTP] OTP for ${email}: ${otp}`);

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Your Goldencoin OTP",
        text: `Your OTP for Goldencoin is: ${otp}. It expires in 10 minutes.`,
        html: `<p>Your OTP for Goldencoin is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
      });
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("[OTP] Error sending email:", error);
      res.status(500).json({ error: "Failed to send OTP email" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    otpStore.delete(email);
    res.json({ message: "OTP verified successfully" });
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
