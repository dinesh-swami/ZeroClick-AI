import 'dotenv/config';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { Resend } from 'resend';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// const resend = new Resend(process.env.RESEND_API_KEY || 're_9ggxHgLs_HB9bev9UDQN2Hb1kr26gdwEe');
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    // Create the unverified user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        authProvider: 'local',
      },
    });
    // Generate Verification Token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    // Store the token in the database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expiresAt,
      },
    });
    // verfication link
    const verifyLink = `${appUrl}/api/auth/verify?token=${token}`;
    // console.log('Verification link:', verifyLink);

    // Send Email via Nodemailer
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
        message:
          'User created successfully. Please check your email to verify your account before logging in.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
