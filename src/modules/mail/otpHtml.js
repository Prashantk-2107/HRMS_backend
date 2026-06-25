function sendOtpHtml(otp, name = "User") {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your One-Time Password</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #f8fafc;
          padding: 40px 0;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          padding: 40px 30px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 35px;
          color: #334155;
          line-height: 1.6;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
        }
        .text {
          font-size: 15px;
          color: #475569;
          margin-bottom: 24px;
        }
        .otp-card {
          background-color: #f5f3ff;
          border: 2px dashed #c084fc;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6b21a8;
          margin-bottom: 8px;
        }
        .otp-code {
          font-size: 38px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #4f46e5;
          margin: 0;
        }
        .warning-text {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 24px;
          border-top: 1px solid #f1f5f9;
          padding-top: 16px;
        }
        .footer {
          background-color: #f1f5f9;
          padding: 24px 35px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Account Security</h1>
            <p>Verification Code Request</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${name},</div>
            <div class="text">
              We received a request to verify your account. Please use the following One-Time Password (OTP) to proceed. This code is valid for <strong>2 minutes</strong>.
            </div>
            <div class="otp-card">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            <div class="warning-text">
              If you didn't request this code, you can safely ignore this email. Someone may have typed your email address by mistake.
            </div>
          </div>
          <div class="footer">
            <p><strong>CRM Team</strong></p>
            <p>Secure Enterprise Portal</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export { sendOtpHtml };
