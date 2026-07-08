import { brevo } from "../../config/brevoConfig.js";

const sendMail = async ({ to, subject, text }) => {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [{ email: to }],
      subject,
      htmlContent: text,
    });

    console.log("Email sent successfully via Brevo:", response);
    return true;
  } catch (error) {
    console.error("Brevo Email Error:", error.response?.body || error.message);
    return false;
  }
};

export { sendMail };
