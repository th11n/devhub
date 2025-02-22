import { pool } from "@/lib/db";
import { NextRequest } from "next/server";

const maxPerPage = 12

export async function GET(request: NextRequest) {
  const pageParam = request?.nextUrl?.searchParams.get('page');
  const page = isNaN(Number(pageParam)) ? 0 : Number(pageParam);
  
  const offset = page * maxPerPage
  const category = request?.nextUrl?.searchParams.get('filterBy')

  const client = await pool.connect();
  try {
    let res
    if (category) {
      res = await client.query(
        `SELECT * FROM posts WHERE status = 'published' AND category = $3 ORDER BY id LIMIT $1 OFFSET $2`, [maxPerPage, offset, category]
      );
    } else {
      console.log(page, offset, maxPerPage)
      res = await client.query(
        `SELECT * FROM posts WHERE status='published' ORDER BY id LIMIT $1 OFFSET $2`, [maxPerPage, offset]
      );
    }
    const pageCountRes = await client.query(
      "SELECT count(id) FROM posts WHERE status='published'"
    );
    const data = res.rows;
    return Response.json({ data, pageCount: Math.ceil(pageCountRes.rows[0].count / maxPerPage) });
  } finally {
    client.release();
  }
}