import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${BACKEND_URL}/api/admin/email-logs/${params.id}/retry`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

