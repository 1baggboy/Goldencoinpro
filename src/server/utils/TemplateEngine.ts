
export interface TemplateOptions {
  title: string;
  headerColor?: string;
  headerTextColor?: string;
  content: string;
  preheader?: string;
  email: string;
}

export class TemplateEngine {
  static render(options: TemplateOptions): string {
    const {
      title,
      headerColor = '#C9A96E',
      headerTextColor = '#0B0B0B',
      content,
      preheader = '',
      email
    } = options;

    const frontendUrl = process.env.FRONTEND_URL || 'https://goldencoin.live';
    const unsubscribeUrl = `${frontendUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

    return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <!--[if mso]>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  <![endif]-->
  <title>${title}</title>
  <style>
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1a1a1a !important;
        color: #e5e5e5 !important;
      }
      .email-container {
        border-color: #333 !important;
      }
      .content-box {
        background-color: #262626 !important;
        color: #e5e5e5 !important;
      }
      .footer-text {
        color: #888 !important;
      }
      .card {
        background-color: #1f1f1f !important;
        border-color: #333 !important;
      }
    }
    .hover-bg-gold:hover {
      background-color: #bfa060 !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f7f7f7;">
  <div style="display: none;">${preheader}</div>
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table class="email-container" role="presentation" width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Branding / Logo -->
          <tr>
            <td align="center" style="padding: 20px;">
               <img src="https://res.cloudinary.com/dctaerfma/image/upload/v1778958362/Logo_rha4xt.jpg" alt="Golden Coin" width="120" style="display: block; border: 0; max-width: 100%; height: auto;">
            </td>
          </tr>
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: ${headerColor}; padding: 30px;">
              <h1 style="margin: 0; color: ${headerTextColor}; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">${title}</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td class="content-box" style="padding: 40px; color: #333333; line-height: 1.6; font-size: 16px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; border-top: 1px solid #eeeeee; text-align: center;">
              <div class="footer-text" style="font-size: 12px; color: #999999; line-height: 1.5;">
                <p style="margin: 0 0 10px;">&copy; ${new Date().getFullYear()} Golden Coin. All rights reserved.</p>
                <p style="margin: 0 0 10px;">Security is our priority. Golden Coin will never ask for your password or OTP via email.</p>
                <p style="margin: 0;">
                  <a href="${unsubscribeUrl}" style="color: #C9A96E; text-decoration: underline;">Unsubscribe</a> from these notifications.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
