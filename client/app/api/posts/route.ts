import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const maxPerPage = 12
const REQUIRED_TOKEN = process.env.API_KEY;

export async function GET(request: NextRequest) {
  const pageParam = request?.nextUrl?.searchParams.get('page');
  const page = isNaN(Number(pageParam)) ? 0 : Number(pageParam);

  const offset = page * maxPerPage
  const category = request?.nextUrl?.searchParams.get('filterBy')
  const status = request?.nextUrl.searchParams.get('status') || 'published'
  const client = await pool.connect();
  try {
    let res
    let pageCountRes
    if (category) {
      res = await client.query(
        `SELECT * FROM posts WHERE status = $4 AND category = $3 ORDER BY id LIMIT $1 OFFSET $2`, [maxPerPage, offset, category, status]
      );
      pageCountRes = await client.query(
        "SELECT count(id) FROM posts WHERE status=$2 AND category = $1", [category, status]
      );
    } else {
      console.log(page, offset, maxPerPage)
      res = await client.query(
        `SELECT * FROM posts WHERE status=$3 ORDER BY id LIMIT $1 OFFSET $2`, [maxPerPage, offset, status]
      );
      pageCountRes = await client.query(
        "SELECT count(id) FROM posts WHERE status=$1", [status]
      );
    }
    const data = res.rows;
    return Response.json({ data, pageCount: Math.ceil(pageCountRes.rows[0].count / maxPerPage) });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== REQUIRED_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const { title, body: content, url, category, image } = body;

  if (!title || !content || !url || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `INSERT INTO posts (title, body, status, url, created_at, category, image)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6) RETURNING id`,
      [title, content, 'published', url, category, image]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('DB insert error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}