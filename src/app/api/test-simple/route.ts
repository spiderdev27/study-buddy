import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Simple test route is working' });
} 