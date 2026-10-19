export const otpEmailHtml = (
  otp: string,
  appName: string = 'E-commerce App',
): string => {
  return `
    <!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>Your verification code</title>
  <!--
    Placeholders (replace with your template engine, e.g. Handlebars / Nunjucks):
    {{app_name}}  {{user_name}}  {{otp}}  {{expiry_minutes}}  {{support_email}}  {{year}}  {{logo_url}}
  -->
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Noto Sans Arabic',Tahoma,sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f6f8;">
    Your ${appName} verification code is ${otp}. It expires in 5 minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- English -->
          <tr>
            <td style="padding:32px 32px 8px 32px;color:#111827;" dir="ltr" align="left">
              <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;">Verify your email</h1>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#374151;">
                Use the code below to complete your verification. It expires in <strong>5 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- OTP box -->
          <tr>
            <td align="center" style="padding:0 32px;">
              <div style="display:inline-block;background-color:#eff6ff;border:1px dashed #2563eb;border-radius:10px;padding:16px 28px;">
                <span style="font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#1d4ed8;">${otp}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 8px 32px;color:#6b7280;font-size:13px;line-height:1.6;" dir="ltr" align="left">
              Never share this code with anyone. ${appName} will never ask for it by phone, chat, or email.
              If you didn't request it, you can safely ignore this email.
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:16px 32px;"><hr style="border:0;border-top:1px solid #e5e7eb;margin:0;" /></td>
          </tr>

          <!-- Arabic -->
          <tr>
            <td style="padding:8px 32px 16px 32px;color:#111827;" dir="rtl" align="right">
              <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:700;">أكّد بريدك الإلكتروني</h2>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.8;color:#374151;">
                استخدم الكود اللي فوق عشان تكمّل عملية التحقق. الكود صالح لمدة <strong>٥ دقائق</strong> بس.
              </p>
              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.8;">
                متشاركش الكود ده مع أي حد. ${appName} عمرها ما هتطلبه منك في مكالمة أو شات أو إيميل.
                لو إنت مطلبتوش، تجاهل الرسالة دي.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#f9fafb;padding:20px 32px;color:#9ca3af;font-size:12px;line-height:1.6;">
              Need help? <a href="mailto:mohakhaled324@gmail.com" style="color:#2563eb;text-decoration:none;">mohakhaled324@gmail.com</a><br />
              &copy; ${new Date(Date.now()).getFullYear()} ${appName}. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
