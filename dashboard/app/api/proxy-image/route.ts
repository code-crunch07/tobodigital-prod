import { NextRequest, NextResponse } from 'next/server';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '') || 'http://localhost:5000';

/**
 * Same-origin image proxy to avoid ERR_BLOCKED_BY_ORB when dashboard and API are on different origins.
 * GET /api/proxy-image?path=/uploads/image-xxx.jpg
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path || !path.startsWith('/uploads/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const url = `${API_ORIGIN}${path}`;
    const res = await fetch(url, {
      headers: { Accept: 'image/*' },
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('Content-Type') || 'application/octet-stream';
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    console.error('[proxy-image]', e);
    return new NextResponse(null, { status: 502 });
  }
}
