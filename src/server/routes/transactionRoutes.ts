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
