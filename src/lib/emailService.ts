import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { APP_CONFIG } from "../config";

/**
 * Sends an email notification to admins by writing to the "mail" collection.
 */
export async function sendAdminEmailNotification(subject: string, text: string, html?: string) {
  const logoUrl = "https://lh3.googleusercontent.com/d/1dc2XZNyptCtTwx8E8-CzPU_o75jokDgF";
  const defaultHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background: #0B0B0B; padding: 20px; text-align: center;">
        <img src="${logoUrl}" alt="Golden Coin" width="120">
      </div>
      <div style="padding: 30px; line-height: 1.6; color: #333;">
        <h2 style="color: #C9A96E; margin-top: 0;">${subject}</h2>
        <p>${text.replace(/\n/g, '<br>')}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">System Auto-Generated Notification</p>
      </div>
    </div>
  `;

  try {
    await addDoc(collection(db, "mail"), {
      to: APP_CONFIG.adminEmails,
      message: {
        subject: `[SYSTEM] ${subject}`,
        text,
        html: html || defaultHtml,
      },
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to send admin email notification:", error);
    // We swallow the error so it doesn't break the critical path
  }
}
