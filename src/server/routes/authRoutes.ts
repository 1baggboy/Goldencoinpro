import { Router } from 'express';
import { z } from 'zod';
import { UAParser } from 'ua-parser-js';
import { AuthService } from '../services/AuthService';
import { authenticate, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

authRouter.post('/register', async (req, res) => {
  try {
    const data = RegisterSchema.parse(req.body);
    const result = await AuthService.register(data);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, idToken, userAgent } = req.body;
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP') as string;
    
    const parser = new UAParser(userAgent || req.headers['user-agent'] as string);
    const deviceDetails = {
      deviceId: req.body.deviceId || "unknown_web",
      deviceString: `${parser.getOS().name} ${parser.getDevice().model || 'PC'}`,
      browser: parser.getBrowser().name,
      os: parser.getOS().name,
      ip,
      location: "Detected via IP", // In real app, call GeoAPI
      userAgent: userAgent || req.headers['user-agent']
    };

    const result = await AuthService.login(email, idToken, deviceDetails);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await AuthService.resetPassword(token, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/verify-email', authenticate, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    const result = await AuthService.verifyEmail(req.user!.userId, code);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
