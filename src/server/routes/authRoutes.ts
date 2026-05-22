import { Router } from 'express';
import { z } from 'zod';
import { UAParser } from 'ua-parser-js';
import { AuthService } from '../services/AuthService';
import { EmailService } from '../services/EmailService';
import { db, auth } from '../lib/firebase';
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

authRouter.post('/cleanup-wrobert', async (req, res) => {
  try {
    const targetEmail = 'wrobert654@yahoo.com';
    if (!db) {
      return res.status(500).json({ error: "Firebase Admin not initialized" });
    }
    
    console.log(`[Admin Cleanup] Started database cleanup for ${targetEmail}`);
    
    // 0. Remove from Auth
    try {
      const user = await auth!.getUserByEmail(targetEmail);
      await auth!.deleteUser(user.uid);
      console.log(`[Admin Cleanup] Deleted auth user: ${user.uid}`);
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') {
        console.error("[Admin Cleanup] Error deleting auth user:", e);
      }
    }
    
    // 1. Delete matching user in 'users' collection
    const usersSnap = await db.collection('users').where('email', '==', targetEmail).get();
    const uids: string[] = [];
    for (const doc of usersSnap.docs) {
      uids.push(doc.id);
      await doc.ref.delete();
      console.log(`[Admin Cleanup] Deleted user doc: ${doc.id}`);
    }
    
    // 2. Clear from 'deletedAccounts' security audit
    const emailDocId = targetEmail.toLowerCase().replace(/[@.]/g, '_');
    try {
      await db.collection('deletedAccounts').doc(emailDocId).delete();
      console.log(`[Admin Cleanup] Deleted deletedAccounts: ${emailDocId}`);
    } catch (e) {
      console.error("[Admin Cleanup] Error deleting deletedAccounts:", e);
    }
    
    // 3. Clear from other collections for all found uids
    const collectionsToClean = [
      'transactions',
      'investments',
      'kyc_submissions',
      'notifications',
      'support_chats',
      'support_tickets',
      'devices',
      'otps',
      'sessions',
      'activityLogs',
      'securityLogs'
    ];
    
    for (const uid of uids) {
      for (const col of collectionsToClean) {
        try {
          const snap = await db.collection(col).where('userId', '==', uid).get();
          for (const doc of snap.docs) {
            await doc.ref.delete();
            console.log(`[Admin Cleanup] Deleted from ${col}: ${doc.id}`);
          }
        } catch (colErr: any) {
          console.warn(`[Admin Cleanup] Warning cleaning ${col} for ${uid}:`, colErr.message);
        }
      }
      
      // Also check if they had nested devices under users/{uid}/devices
      try {
        const devicesSnap = await db.collection('users').doc(uid).collection('devices').get();
        for (const devDoc of devicesSnap.docs) {
          await devDoc.ref.delete();
        }
      } catch (devErr: any) {
        console.warn(`[Admin Cleanup] Warning cleaning nested devices for ${uid}:`, devErr.message);
      }
    }
    
    // 4. Additionally delete any support_chats and support_tickets queried by email
    try {
      const chatsByEmail = await db.collection('support_chats').where('userEmail', '==', targetEmail).get();
      for (const doc of chatsByEmail.docs) {
        await doc.ref.delete();
        console.log(`[Admin Cleanup] Deleted support_chats by email: ${doc.id}`);
      }
    } catch (e) {
      console.error("[Admin Cleanup] Error deleting chats by email:", e);
    }
    
    res.json({ success: true, message: `Database cleared for ${targetEmail}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
    if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
    const { deviceDetails = {} } = req.body;
    const userDoc = await db!.collection('users').doc(req.user!.userId).get();
    if (!userDoc.exists) throw new Error("User not found");
    const userData = userDoc.data() as any;

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP') as string;
    const location = await AuthService.getLocationFromIP(ip);
    
    // Check if device already exists in firestore
    const devicesRef = db.collection('users').doc(req.user!.userId).collection('devices');
    const existingDeviceQuery = await devicesRef.where('deviceId', '==', deviceDetails.deviceId).get();
    const isNewDevice = existingDeviceQuery.empty;

    const enrichedDeviceDetails = {
      ...deviceDetails,
      ip,
      location,
      isNewDevice,
      browser: deviceDetails.browser || 'Unknown',
      os: deviceDetails.os || 'Unknown',
      time: deviceDetails.time || new Date().toLocaleString()
    };

    await EmailService.sendLoginAlert({
      id: req.user!.userId,
      email: userData.email,
      firstName: userData.firstName || userData.name?.split(' ')[0] || 'User',
    }, enrichedDeviceDetails);

    res.json({ 
      success: true, 
      ip, 
      location,
      browser: enrichedDeviceDetails.browser,
      os: enrichedDeviceDetails.os
    });
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
