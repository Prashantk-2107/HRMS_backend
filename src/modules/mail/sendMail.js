import { transporter } from "../../config/nodemailer.js";

const sendMail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_ID,
      to,
      subject,
      html: text,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export { sendMail };
