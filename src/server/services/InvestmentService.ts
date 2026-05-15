import { EmailService } from './EmailService';
import { db } from '../lib/firebase';

export class InvestmentService {
  static async purchasePlan(userId: string, planName: string, amount: number, roi: number, durationDays: number) {
    if (!db) throw new Error("Firebase Admin not initialized");
    
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) throw new Error("User not found");
    const user = { ...userDoc.data(), id: userId } as any;

    if ((user.balance || 0) < amount) throw new Error("Insufficient balance");

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const expectedReturn = amount + (amount * (roi / 100));

    const investmentData = {
      userId,
      planName,
      amount,
      roiPercentage: roi,
      expectedReturn,
      endDate,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const invRef = await db.collection('investments').add(investmentData);
    const investment = { id: invRef.id, ...investmentData };

    // Deduct balance
    const newBalance = (user.balance || 0) - amount;
    await userDocRef.update({ balance: newBalance });

    await EmailService.sendEmail({
      to: user.email,
      subject: `Investment Plan Purchased: ${planName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #C9A96E; padding: 20px; text-align: center;">
            <h1 style="color: #0B0B0B; margin: 0;">Investment Confirmation</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <p>Hello ${user.firstName || 'User'},</p>
            <p>You have successfully invested in the <strong>${planName}</strong> plan.</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
              <p><strong>ROI:</strong> ${roi}%</p>
              <p><strong>Expected Payout:</strong> $${expectedReturn.toLocaleString()}</p>
              <p><strong>Maturity Date:</strong> ${endDate.toLocaleDateString()}</p>
            </div>
            <p>Your profits will be credited automatically upon maturity.</p>
          </div>
        </div>
      `,
      type: 'INVESTMENT_ALERT'
    });

    return investment;
  }
}

