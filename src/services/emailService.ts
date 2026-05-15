import { Resend } from 'resend';

// Lazy initialize Resend to avoid crashing if the API key is missing during build
let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not defined in environment variables.");
      return null;
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export type EmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
};

/**
 * Sends an email using the Resend API.
 */
export async function sendEmail(options: EmailOptions) {
  const client = getResendClient();
  if (!client) {
    throw new Error("Resend client not initialized. Check your RESEND_API_KEY.");
  }

  const { to, subject, html, from, replyTo } = options;
  
  // Use a verified domain or the Resend default for unverified accounts
  // The user confirmed goldencoin.live is their domain.
  const sender = from || "security@goldencoin.live";

  console.log(`[EmailService] Attempting to send email to: ${to} from: ${sender}`);

  const { data, error } = await client.emails.send({
    from: sender,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo: replyTo || "support@goldencoin.live",
  });

  if (error) {
    console.error("[EmailService Error]:", JSON.stringify(error, null, 2));
    throw new Error(error.message);
  }

  console.log(`[EmailService Success]: Message sent successfully. ID: ${data?.id}`);
  return data;
}
