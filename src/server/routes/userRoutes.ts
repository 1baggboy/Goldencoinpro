import { Router } from 'express';
import { db } from '../lib/firebase';
import { EmailService } from '../services/EmailService';
import { authenticate, AuthRequest } from '../middleware/auth';

export const userRouter = Router();

userRouter.get('/profile', authenticate, async (req: AuthRequest, res) => {
  if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
  const userDocRef = db.collection('users').doc(req.user!.userId);
  const userDoc = await userDocRef.get();
  
  if (!userDoc.exists) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const devicesSnap = await db.collection('devices').where('userId', '==', req.user!.userId).get();
  const activityLogsSnap = await db.collection('activityLogs').where('userId', '==', req.user!.userId).orderBy('createdAt', 'desc').limit(10).get();

  const devices = devicesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const activityLogs = activityLogsSnap.docs.map(a => ({ id: a.id, ...a.data() }));

  const user = { id: req.user!.userId, ...userDoc.data(), devices, activityLogs };
  res.json(user);
});

userRouter.post('/kyc', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
    const { documentType, documentFront, documentBack, selfie } = req.body;
    
    const kycRef = await db.collection('kycVerifications').add({
      userId: req.user!.userId,
      documentType,
      documentFront,
      documentBack,
      selfie,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await db.collection('users').doc(req.user!.userId).update({ kycStatus: 'PENDING' });

    const userDoc = await db.collection('users').doc(req.user!.userId).get();
    const user = { id: req.user!.userId, ...userDoc.data() } as any;

    await EmailService.sendKYCAlert(user, 'SUBMITTED');

    res.json({ id: kycRef.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

userRouter.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
    const { firstName, lastName, phone } = req.body;
    const userRef = db.collection('users').doc(req.user!.userId);
    await userRef.update({ firstName, lastName, phone, updatedAt: new Date() });
    
    const userDoc = await userRef.get();
    const user = { id: req.user!.userId, ...userDoc.data() } as any;

    await EmailService.sendSecurityAlert(user, "Your profile details were updated.");
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
