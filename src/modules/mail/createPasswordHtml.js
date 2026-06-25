function createPasswordHtml(setupLink, name = "Employee") {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Set Up Your Account Password</title>
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
        .btn-container {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff !important;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          padding: 12px 32px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
          transition: background-color 0.2s ease;
        }
        .btn:hover {
          background-color: #4338ca;
        }
        .link-text {
          font-size: 12px;
          color: #94a3b8;
          word-break: break-all;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
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
            <h1>Welcome to CRM</h1>
            <p>Account Creation & Setup</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${name},</div>
            <div class="text">
              Your CRM account has been created. Please click the button below to set up your password and complete your registration.
            </div>
            <div class="btn-container">
              <a href="${setupLink}" target="_blank" class="btn">Set Up Your Password</a>
            </div>
            <div class="text">
              Please note that this setup link is only valid for <strong>24 hours</strong>.
            </div>
            <div class="link-text">
              If the button above does not work, copy and paste the following link into your browser: <br/>
              <a href="${setupLink}" target="_blank" style="color: #4f46e5;">${setupLink}</a>
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

export { createPasswordHtml };
