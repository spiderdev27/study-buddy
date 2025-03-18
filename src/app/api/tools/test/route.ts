import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Test route is working' });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Test POST route is working' });
} 