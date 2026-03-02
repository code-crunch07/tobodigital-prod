import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '') || 'http://localhost:5000';

/** When dashboard and uploads share the same server, read from disk instead of fetching API. */
const UPLOADS_DIR = process.env.CLIENT_UPLOADS_DIR || process.env.UPLOADS_DIR;

const MIMES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};

/**
 * Same-origin image proxy to avoid ERR_BLOCKED_BY_ORB when dashboard and API are on different origins.
 * GET /api/proxy-image?path=/uploads/image-xxx.jpg
 * Prefers local filesystem when CLIENT_UPLOADS_DIR or UPLOADS_DIR is set (same-server deployment).
 */
export async function GET(request: NextRequest) {
  const pathParam = request.nextUrl.searchParams.get('path');
  if (!pathParam || !pathParam.startsWith('/uploads/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const filename = pathParam.replace(/^\/uploads\//, '');
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  // 1. Try local filesystem when uploads dir is configured (same server)
  if (UPLOADS_DIR) {
    try {
      const dir = path.resolve(UPLOADS_DIR);
      const filePath = path.join(dir, filename);
      if (!filePath.startsWith(dir)) {
        return new NextResponse(null, { status: 400 });
      }
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const buf = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        const contentType = MIMES[ext] || 'application/octet-stream';
        return new NextResponse(buf, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch (e: any) {
      if (e?.code !== 'ENOENT') {
        console.error('[proxy-image] fs', e);
      }
    }
  }

  // 2. Fallback: fetch from API
  try {
    const url = `${API_ORIGIN}${pathParam}`;
    const res = await fetch(url, {
      headers: { Accept: 'image/*' },
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get('Content-Type') || MIMES[path.extname(filename).toLowerCase()] || 'application/octet-stream';
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    console.error('[proxy-image] fetch', e);
    return new NextResponse(null, { status: 502 });
  }
}
