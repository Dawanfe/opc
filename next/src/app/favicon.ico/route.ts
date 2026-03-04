import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // 读取 ico.png 文件并作为 favicon 返回
    const iconPath = join(process.cwd(), 'public', 'ico.png');
    const iconBuffer = readFileSync(iconPath);

    return new NextResponse(iconBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
