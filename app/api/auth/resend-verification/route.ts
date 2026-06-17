import 'dotenv/config';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const resend = new Resend(process.env.RESEND_API_KEY || 're_9ggxHgLs_HB9bev9UDQN2Hb1kr26gdwEe');
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to prevent email enumeration
      return NextResponse.json(
        { message: 'If the email exists and is unverified, a new link has been sent.' },
        { status: 200 }
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
    }

    // Invalidate old tokens for this identifier
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate new Verification Token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expiresAt,
      },
    });

    // Send Email via Resend
    const verifyLink = `${appUrl}/api/auth/verify?token=${token}`;

    // node mailer setup

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: `ZeroClick <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2>Verify your email</h2>

      <p>Welcome to ZeroClick.</p>

      <p>Click the button below to verify your email address:</p>

      <a
        href="${verifyLink}"
        style="
          display:inline-block;
          background:#4f46e5;
          color:white;
          padding:12px 20px;
          text-decoration:none;
          border-radius:8px;
        "
      >
        Verify Email
      </a>

      <p style="margin-top:20px;">
        Or copy and paste this link:
      </p>

      <p>${verifyLink}</p>

      <p>This link expires in 24 hours.</p>
    </div>
  `,
    });

    return NextResponse.json(
      {
        message: 'Verification link resent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
