import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { APP_CONFIG } from "../config";

/**
 * Sends an email notification to admins by writing to the "mail" collection.
 * This requires the "Trigger Email" Firebase Extension to be installed
 * and configured to listen to the "mail" collection.
 */
export async function sendAdminEmailNotification(subject: string, text: string, html?: string) {
  try {
    await addDoc(collection(db, "mail"), {
      to: APP_CONFIG.adminEmails,
      message: {
        subject,
        text,
        html: html || text,
      },
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to send admin email notification:", error);
    // We swallow the error so it doesn't break the critical path
  }
}
