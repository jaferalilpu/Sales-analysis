import { NextRequest, NextResponse } from 'next/server';

import { getBackendUrl } from '@/lib/api-config';
const BACKEND_URL = getBackendUrl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { firstName, lastName, email, subject, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send to backend
    const response = await fetch(`${BACKEND_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        subject,
        message,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return NextResponse.json(
        { success: true, message: 'Contact form submitted successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to submit contact form' },
        { status: response.status || 500 }
      );
    }
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

