import { Router } from 'express';
import { db } from '../lib/firebase';
import { EmailService } from '../services/EmailService';
import { authenticate, authorizeAdmin } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.get('/stats', authenticate, authorizeAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
  const userCountSnap = await db.collection('users').count().get();
  const txCountSnap = await db.collection('transactions').where('status', '==', 'PENDING').count().get();
  const emailLogsCountSnap = await db.collection('emailLogs').count().get();
  res.json({ 
    userCount: userCountSnap.data().count, 
    pendingTransactions: txCountSnap.data().count, 
    emailLogsCount: emailLogsCountSnap.data().count 
  });
});

adminRouter.post('/newsletter/broadcast', authenticate, authorizeAdmin, async (req, res) => {
  if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
  const { subject, content } = req.body;
  const subscribersSnap = await db.collection('newsletters').where('isSubscribed', '==', true).get();
  
  // In production, use a queue or job processor for bulk emails
  for (const doc of subscribersSnap.docs) {
    const sub = doc.data();
    await EmailService.sendEmail({
      to: sub.email,
      subject,
      html: `<div>${content}</div><br><p><a href="${process.env.FRONTEND_URL}/unsubscribe?email=${sub.email}">Unsubscribe</a></p>`,
      type: 'NEWSLETTER'
    });
  }
  res.json({ success: true, count: subscribersSnap.docs.length });
});
