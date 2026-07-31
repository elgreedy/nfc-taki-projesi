import { NextRequest, NextResponse } from 'next/server';
import { deleteFromR2 } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL zorunludur.' }, { status: 400 });

    const success = await deleteFromR2(url);
    if (!success) {
      return NextResponse.json({ error: 'R2 silme başarısız: geçersiz URL veya hata.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}