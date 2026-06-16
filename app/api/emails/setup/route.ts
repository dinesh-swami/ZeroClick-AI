import { NextResponse } from 'next/server';
import { corsair, ensureCorsairSetup } from '@/lib/corsair';
import { generateOAuthUrl } from 'corsair/oauth';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
export async function GET() {
  try {
    await ensureCorsairSetup();
    const { url: authorizeUrl } = await generateOAuthUrl(corsair, 'gmail', {
      tenantId: 'test-user-id',
      redirectUri: 'http://localhost:3000/callback',
    });
    return NextResponse.json({ authorizeUrl });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to generate OAuth URL') },
      { status: 500 }
    );
  }
}
