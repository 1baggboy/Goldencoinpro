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
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) throw new Error("User not found");

    const user = { ...userDoc.data(), id: userId } as any;

    if (user.balance < amount) throw new Error("Insufficient balance");

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
    const user = { ...userDoc.data(), id: tx.userId } as any;

    if (tx.type === 'DEPOSIT') {
      const newBalance = (user.balance || 0) + tx.amount;
      await userRef.update({ balance: newBalance });
    } else if (tx.type === 'WITHDRAWAL') {
      const newBalance = (user.balance || 0) - tx.amount;
      await userRef.update({ balance: newBalance });
    }

    await EmailService.sendTransactionAlert(user, updatedTx);

    return updatedTx;
  }
}

