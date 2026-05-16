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

    const ticket = { id: ticketRef.id, subject, status: 'OPEN' };
    await EmailService.sendSupportTicketAlert(user, ticket);

    return ticket;
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
      await EmailService.sendSupportReply(user, ticket, message);
    }

    return { id: replyRef.id, ticketId, message };
  }
}

