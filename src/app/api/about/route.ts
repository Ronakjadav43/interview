import { NextRequest, NextResponse } from 'next/server';
import { getAbout, updateAbout } from '@/lib/data';

export async function GET() {
  try {
    const about = getAbout();
    return NextResponse.json(about);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch about data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateAbout(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update about data' }, { status: 500 });
  }
}
