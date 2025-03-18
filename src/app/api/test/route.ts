import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ message: 'Test endpoint is working' });
}

export async function POST() {
  return NextResponse.json({ message: 'Test POST endpoint is working' });
} 