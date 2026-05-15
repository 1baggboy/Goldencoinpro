import { Router } from 'express';
import { SupportService } from '../services/SupportService';
import { authenticate, AuthRequest } from '../middleware/auth';

export const supportRouter = Router();

supportRouter.post('/ticket', authenticate, async (req: AuthRequest, res) => {
  try {
    const { subject, message } = req.body;
    const ticket = await SupportService.createTicket(req.user!.userId, subject, message);
    res.json(ticket);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

supportRouter.post('/reply', authenticate, async (req: AuthRequest, res) => {
  try {
    const { ticketId, message } = req.body;
    const reply = await SupportService.replyToTicket(ticketId, req.user!.userId, 'USER', message);
    res.json(reply);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
