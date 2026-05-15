import { EmailService } from './EmailService';
import { db } from '../lib/firebase';

export class SupportService {
  static async createTicket(userId: string, subject: string, message: string) {
    if (!db) throw new Error("Firebase Admin not initialized");
    
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) throw new Error("User not found");

    const user = { ...userDoc.data(), id: userId } as any;

    const ticketRef = await db.collection('supportTickets').add({
      userId,
      subject,
      status: 'OPEN',
      priority: 'MEDIUM',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await db.collection('supportMessages').add({
      ticketId: ticketRef.id,
      senderId: userId,
      senderType: 'USER',
      message: message,
      createdAt: new Date()
    });

    return { id: ticketRef.id, subject, status: 'OPEN' };
  }

  static async replyToTicket(ticketId: string, senderId: string, senderType: 'USER' | 'ADMIN', message: string) {
    if (!db) throw new Error("Firebase Admin not initialized");
    
    const ticketRef = db.collection('supportTickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();

    if (!ticketDoc.exists) throw new Error("Ticket not found");
    const ticket = ticketDoc.data() as any;

    const userDocRef = db.collection('users').doc(ticket.userId);
    const userDoc = await userDocRef.get();
    const user = { ...userDoc.data(), id: ticket.userId } as any;

    const replyRef = await db.collection('supportMessages').add({
      ticketId,
      senderId,
      senderType,
      message,
      createdAt: new Date()
    });

    await ticketRef.update({ updatedAt: new Date() });

    if (senderType === 'ADMIN') {
      // Send email notification to user
      await EmailService.sendEmail({
        to: user.email,
        subject: `New Reply to your support ticket: ${ticket.subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #C9A96E; padding: 20px; text-align: center;">
              <h1 style="color: #0B0B0B; margin: 0;">Support Notification</h1>
            </div>
            <div style="padding: 30px; color: #333;">
              <p>Hello ${user.firstName || 'User'},</p>
              <p>An administrator has replied to your support ticket.</p>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>${message}</p>
              </div>
              <p>You can view the full conversation in your dashboard.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/support" style="background-color: #C9A96E; color: #0B0B0B; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Ticket</a>
              </div>
            </div>
          </div>
        `,
        type: 'SUPPORT_REPLY'
      });
    }

    return { id: replyRef.id, ticketId, message };
  }
}

