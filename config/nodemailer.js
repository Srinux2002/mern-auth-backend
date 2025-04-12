import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // Set to true if using port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"srinjoy" <${process.env.SENDER_EMAIL}>`, //It Must be a verified sender
    to,
    subject,
    text,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:");
  } catch (error) {
    console.error("❌ Email Sending Error:", error.message);
  }
};
