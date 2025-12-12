import { NextRequest, NextResponse } from 'next/server';
import { RegisterRequest, AuthResponse } from '@/types/auth';
import { getErrorMessage } from '@/types/common';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Clean up the body - remove undefined values and empty strings for optional fields
    const cleanedBody: Partial<RegisterRequest> = {
      email: body.email?.trim(),
      password: body.password,
      name: body.name?.trim(),
    };
    
    // Only include phone if it's provided and not empty (Joi rejects empty strings for optional fields)
    if (body.phone && typeof body.phone === 'string' && body.phone.trim() !== '') {
      cleanedBody.phone = body.phone.trim();
    }
    // Don't include phone at all if it's empty
    
    // Only include referralCode if it's provided and not empty (Joi rejects empty strings for optional fields)
    if (body.referralCode && typeof body.referralCode === 'string' && body.referralCode.trim() !== '') {
      cleanedBody.referralCode = body.referralCode.trim();
    }
    // Don't include referralCode at all if it's empty

    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedBody),
    });

    let data: AuthResponse;
    try {
      data = await response.json() as AuthResponse;
      
    } catch (parseError) {
      const text = await response.text();
      // Error logging removed - production ready
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid response from server',
          error: text 
        },
        { status: response.status || 500 }
      );
    }
    
    // If registration is successful, return the response
    if (response.ok && data.success) {
      // For registration, we don't set cookies yet since user needs to verify email
      // Just return the success response
      return NextResponse.json(data, { status: response.status });
    }
    
    // Return error response with detailed message
    return NextResponse.json(
      { 
        success: false,
        message: data.message || data.error || 'Registration failed',
        errors: data.errors || undefined
      }, 
      { status: response.status }
    );
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage || 'Internal server error',
        error: 'Failed to process registration request'
      },
      { status: 500 }
    );
  }
}
