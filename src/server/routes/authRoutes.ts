import { Router } from 'express';
import { z } from 'zod';
import { UAParser } from 'ua-parser-js';
import { AuthService } from '../services/AuthService';
import { EmailService } from '../services/EmailService';
import { db } from '../lib/firebase';
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
    const location = await AuthService.getLocationFromIP(ip);
    
    const parser = new UAParser(userAgent || req.headers['user-agent'] as string);
    const deviceDetails = {
      deviceId: req.body.deviceId || "unknown_web",
      deviceString: `${parser.getOS().name} ${parser.getDevice().model || 'PC'}`,
      browser: parser.getBrowser().name,
      os: parser.getOS().name,
      ip,
      location,
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

authRouter.post('/change-password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { newPassword } = req.body;
    const result = await AuthService.changePassword(req.user!.userId, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/welcome', authenticate, async (req: AuthRequest, res) => {
  try {
    const userDoc = await db!.collection('users').doc(req.user!.userId).get();
    if (!userDoc.exists) throw new Error("User not found");
    const userData = userDoc.data() as any;
    
    await EmailService.sendWelcomeEmail({
      id: req.user!.userId,
      email: userData.email,
      firstName: userData.firstName || userData.name?.split(' ')[0] || 'User',
      role: userData.role || 'USER'
    });
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/login-notification', authenticate, async (req: AuthRequest, res) => {
  try {
    const { deviceDetails } = req.body;
    const userDoc = await db!.collection('users').doc(req.user!.userId).get();
    if (!userDoc.exists) throw new Error("User not found");
    const userData = userDoc.data() as any;

    await EmailService.sendLoginAlert({
      id: req.user!.userId,
      email: userData.email,
      firstName: userData.firstName || userData.name?.split(' ')[0] || 'User',
    }, deviceDetails);

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

authRouter.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await AuthService.logout(refreshToken);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
