import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/types/common';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Forward to backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await backendResponse.json().catch(() => ({
      success: false,
      message: 'Failed to parse backend response'
    }));

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { success: false, message: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}
