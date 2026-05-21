import { Router } from 'express';
import { TransactionService } from '../services/TransactionService';
import { authenticate, AuthRequest } from '../middleware/auth';

export const transactionRouter = Router();

transactionRouter.post('/deposit', authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, method } = req.body;
    const tx = await TransactionService.createDeposit(req.user!.userId, amount, method);
    res.json(tx);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

transactionRouter.post('/withdraw', authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, method, details } = req.body;
    const tx = await TransactionService.createWithdrawal(req.user!.userId, amount, method, details);
    res.json(tx);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

transactionRouter.post('/export', authenticate, async (req: AuthRequest, res) => {
  try {
    const { email } = req.body;
    const transactions = await TransactionService.exportTransactions(req.user!.userId);
    
    // Simple CSV generator
    const header = "ID,Type,Amount,Status,Date\n";
    const rows = transactions.map((tx: any) => 
      `${tx.id},${tx.type},${tx.amount || tx.amountBtc || 0},${tx.status},${tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt}`
    ).join("\n");
    
    const csvContent = header + rows;
    
    if (email) {
      // Need EmailService to support attachments.
      // For now, simple implementation to just send the CSV data in the body if email is requested, or not supported. 
      // User said "also". Maybe a separate button to email? Or a dropdown.
      // Let's implement an email sending route separately.
      return res.status(501).json({ error: "Email attachment not yet supported." });
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
