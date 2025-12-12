import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/types/common';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// GET /api/drops/current - Get current live drop (public)
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/drops/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    // Handle non-OK responses gracefully
    if (!response.ok) {
      
      // Return empty data instead of error to prevent homepage crash
      return NextResponse.json({
        success: true,
        data: {
          drop: null
        }
      });
    }

    const data = await response.json();
     // Debug log
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    // Return empty data instead of error to prevent homepage crash
    return NextResponse.json({
      success: true,
      data: {
        drop: null
      }
    });
  }
}

