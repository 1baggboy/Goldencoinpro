import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './EmailService';
import { db } from '../lib/firebase';

export class TransactionService {
  static async createDeposit(userId: string, amount: number, method: string) {
    if (!db) throw new Error("Firebase Admin not initialized");
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) throw new Error("User not found");

    const user = { ...userDoc.data(), id: userId } as any;

    const reference = `DEP-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    const tx = {
      userId,
      amount,
      type: 'DEPOSIT',
      status: 'PENDING',
      method,
      reference,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('transactions').add(tx);

    await EmailService.sendTransactionAlert(user, tx);
    
    return tx;
  }

  static async createWithdrawal(userId: string, amount: number, method: string, details: string) {
    if (!db) throw new Error("Firebase Admin not initialized");

    if (amount < 50) throw new Error("Minimum withdrawal amount is $50");

    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) throw new Error("User not found");

    const user = { ...userDoc.data(), id: userId } as any;

    if (user.balance < amount) throw new Error("Insufficient balance");

    // Check daily limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const withdrawalsToday = await db.collection('transactions')
      .where('userId', '==', userId)
      .where('type', '==', 'WITHDRAWAL')
      .where('status', 'in', ['PENDING', 'SUCCESS'])
      .where('createdAt', '>=', startOfDay)
      .get();

    let totalWithdrawnToday = 0;
    withdrawalsToday.forEach(doc => {
      totalWithdrawnToday += doc.data().amount;
    });

    if (totalWithdrawnToday + amount > 50000) {
      throw new Error(`Daily withdrawal limit reached. You have already withdrawn $${totalWithdrawnToday.toLocaleString()} today. Maximum daily limit is $50,000.`);
    }

    // Deduct balance immediately
    const newBalance = (user.balance || 0) - amount;
    await userDocRef.update({ balance: newBalance });

    const reference = `WTH-${uuidv4().substring(0, 8).toUpperCase()}`;

    const tx = {
      userId,
      amount,
      type: 'WITHDRAWAL',
      status: 'PENDING',
      method,
      details,
      reference,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('transactions').add(tx);

    await EmailService.sendTransactionAlert(user, tx);

    return tx;
  }

  static async approveTransaction(txId: string) {
    if (!db) throw new Error("Firebase Admin not initialized");
    const txRef = db.collection('transactions').doc(txId);
    const txDoc = await txRef.get();
    
    if (!txDoc.exists) throw new Error("Transaction not found");
    const tx = txDoc.data() as any;

    if (tx.status !== 'PENDING') throw new Error("Transaction already processed");

    await txRef.update({ 
      status: 'SUCCESS',
      updatedAt: new Date()
    });

    const updatedTx = { ...tx, status: 'SUCCESS' };

    const userRef = db.collection('users').doc(tx.userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error("User not found");
    const user = { ...userDoc.data(), id: tx.userId } as any;

    if (tx.type === 'DEPOSIT') {
      const amountBtc = tx.amountBtc || 0;
      const amountUsd = tx.amountUsd || tx.amount || 0;
      await userRef.update({ 
        usdBalance: (user.usdBalance || 0) + amountUsd,
        totalDepositedUsd: (user.totalDepositedUsd || 0) + amountUsd,
        btcBalance: (user.btcBalance || 0) + amountBtc,
        tradingBalanceBtc: (user.tradingBalanceBtc || 0) + amountBtc,
        totalDeposited: (user.totalDeposited || 0) + amountBtc
      });
    }
    // Withdrawal balance already deducted at request time

    await EmailService.sendTransactionAlert(user, updatedTx);

    return updatedTx;
  }

  static async rejectTransaction(txId: string, reason: string) {
    if (!db) throw new Error("Firebase Admin not initialized");
    const txRef = db.collection('transactions').doc(txId);
    const txDoc = await txRef.get();
    
    if (!txDoc.exists) throw new Error("Transaction not found");
    const tx = txDoc.data() as any;

    if (tx.status !== 'PENDING') throw new Error("Transaction already processed");

    await txRef.update({ 
      status: 'REJECTED',
      rejectionReason: reason,
      updatedAt: new Date()
    });

    const updatedTx = { ...tx, status: 'REJECTED', rejectionReason: reason };

    const userRef = db.collection('users').doc(tx.userId);
    const userDoc = await userRef.get();
    const user = { ...userDoc.data(), id: tx.userId } as any;

    if (tx.type === 'WITHDRAWAL') {
      // Refund balance
      const amountBtc = tx.amountBtc || 0;
      const amountUsd = tx.amountUsd || tx.amount || 0;
      await userRef.update({ 
        btcBalance: (user.btcBalance || 0) + amountBtc,
        tradingBalanceBtc: (user.tradingBalanceBtc || 0) + amountBtc,
        usdBalance: (user.usdBalance || 0) + amountUsd
      });
    }

    await EmailService.sendTransactionAlert(user, updatedTx);

    return updatedTx;
  }

  static async exportTransactions(userId: string) {
    if (!db) throw new Error("Firebase Admin not initialized");
    
    const snapshot = await db.collection('transactions')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();
      
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

