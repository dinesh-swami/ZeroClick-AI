import 'dotenv/config';
import nodemailer from 'nodemailer';

async function sendTestEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `ZeroClick <${process.env.GMAIL_USER}>`,
      to: 'ds4573700@gmail.com',
      subject: 'ZeroClick Email Test',
      html: `
        <h1>Email Working 🚀</h1>
        <p>If you received this email, Nodemailer is configured correctly.</p>
        <a href="https://google.com">Test Link</a>
      `,
    });

    console.log('✅ Email Sent Successfully');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Email Failed');
    console.error(error);
  }
}

sendTestEmail();
