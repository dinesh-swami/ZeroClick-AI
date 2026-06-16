import { NextResponse } from 'next/server';
import { verifyToken, getRefreshTokenCookie } from '@/lib/auth';
import { getCorsairClient, corsair, ensureCorsairSetup } from '@/lib/corsair';
import { generateOAuthUrl } from 'corsair/oauth';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
export async function GET() {
  try {
    const refreshToken = await getRefreshTokenCookie();
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in' } },
        { status: 401 }
      );
    }
    const payload = verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }
    const userId = payload.userId;
    await ensureCorsairSetup();
    // We pass integration and userId so we can identify them in the callback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/auth/corsair/callback`;
    const { url } = await generateOAuthUrl(corsair, 'gmail', { tenantId: userId, redirectUri });

    return NextResponse.redirect(url);
  } catch (error: unknown) {
    console.error('Error generating Gmail OAuth URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: getErrorMessage(error, 'Failed to generate OAuth URL'),
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const refreshToken = await getRefreshTokenCookie();
    if (!refreshToken)
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in' } },
        { status: 401 }
      );
    const payload = verifyToken(refreshToken);
    if (!payload)
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );

    const userId = payload.userId;
    await ensureCorsairSetup();
    const tenant = await getCorsairClient(userId);

    // Revoke the integration by clearing the account credentials
    try {
      await tenant.gmail.keys.set_access_token(null);
      await tenant.gmail.keys.set_refresh_token(null);
    } catch (err: unknown) {
      if (!getErrorMessage(err, '').includes('Account not found')) {
        throw err;
      }
    }

    const { prisma } = await import('@/lib/prisma');
    await prisma.user.update({
      where: { id: userId },
      data: { gmailConnected: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error revoking Gmail integration:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: getErrorMessage(error, 'Failed to revoke integration'),
        },
      },
      { status: 500 }
    );
  }
}
