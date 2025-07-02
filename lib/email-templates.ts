export function getPasswordResetEmailTemplate(name: string, url: string) {
  return {
    subject: "Reset your password",
    text: `Click the link to reset your password: ${url}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eeeeee;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #69ccf1;
          color: white !important;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eeeeee;
          font-size: 12px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Seazr Password Reset Request</h2>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="text-align: center;">
          <a href="${url}" class="button">Reset My Password</a>
        </p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>This password reset link will expire in 1 hour.</p>
        <p>Thanks,<br>Seazr</p>
      </div>
      <div class="footer">
        <p>If the button doesn't work, copy and paste this link into your browser: ${url}</p>
      </div>
    </body>
    </html>
    `
  };
}