import { Router } from 'express';
import { InvestmentService } from '../services/InvestmentService';
import { authenticate, AuthRequest } from '../middleware/auth';

export const investmentRouter = Router();

investmentRouter.post('/purchase', authenticate, async (req: AuthRequest, res) => {
  try {
    const { planName, amount, roi, durationDays } = req.body;
    const inv = await InvestmentService.purchasePlan(
      req.user!.userId,
      planName,
      amount,
      roi,
      durationDays
    );
    res.json(inv);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
