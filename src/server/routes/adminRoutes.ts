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

// KYC Management
adminRouter.post('/kyc/approve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
    const { userId } = req.body;
    
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
    const user = { ...userSnap.data(), id: userId } as any;

    await userRef.update({ kycStatus: 'verified' });
    
    // Update kycSubmission doc
    const kycSnap = await db.collection('kyc_submissions')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    
    if (!kycSnap.empty) {
      await kycSnap.docs[0].ref.update({ status: 'verified', updatedAt: new Date() });
    }

    await EmailService.sendKYCAlert(user, 'verified');
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/kyc/reject', authenticate, authorizeAdmin, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
    const { userId, reason } = req.body;
    
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
    const user = { ...userSnap.data(), id: userId } as any;

    await userRef.update({ kycStatus: 'rejected' });

    // Update kycSubmission doc
    const kycSnap = await db.collection('kyc_submissions')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    
    if (!kycSnap.empty) {
      await kycSnap.docs[0].ref.update({ status: 'rejected', updatedAt: new Date(), rejectionReason: reason });
    }

    await EmailService.sendKYCAlert(user, 'rejected', reason);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Transaction Management
adminRouter.post('/transactions/approve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const { TransactionService } = await import('../services/TransactionService');
    const result = await TransactionService.approveTransaction(transactionId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/transactions/reject', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    const { TransactionService } = await import('../services/TransactionService');
    const result = await TransactionService.rejectTransaction(transactionId, reason);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// User Management
adminRouter.post('/users/update-balance', authenticate, authorizeAdmin, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
    const { userId, amount, action } = req.body; // action: 'add' | 'subtract' | 'set'
    
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
    
    const user = { ...userSnap.data(), id: userId } as any;
    let newBalance = user.balance || 0;
    
    if (action === 'add') newBalance += amount;
    else if (action === 'subtract') newBalance -= amount;
    else if (action === 'set') newBalance = amount;
    
    await userRef.update({ balance: newBalance, updatedAt: new Date() });

    await EmailService.sendSecurityAlert(user, `Your account balance was adjusted by an administrator. New balance: $${newBalance.toLocaleString()}`);
    
    res.json({ success: true, newBalance });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/users/suspend', authenticate, authorizeAdmin, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
    const { userId, reason } = req.body;
    
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
    
    const user = { ...userSnap.data(), id: userId } as any;
    await userRef.update({ isSuspended: true, updatedAt: new Date() });

    await EmailService.sendSecurityAlert(user, `Your account has been suspended. Reason: ${reason || 'Violation of terms'}. Please contact support for more details.`);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post('/users/unsuspend', authenticate, authorizeAdmin, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Firebase DB not initialized" });
    const { userId } = req.body;
    
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
    
    const user = { ...userSnap.data(), id: userId } as any;
    await userRef.update({ isSuspended: false, updatedAt: new Date() });

    await EmailService.sendSecurityAlert(user, "Your account suspension has been lifted. You can now access your dashboard again.");
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
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
