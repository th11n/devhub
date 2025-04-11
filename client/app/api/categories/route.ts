import { pool } from "@/lib/db";

export async function GET() {
  const client = await pool.connect();

  try {
    const res = await client.query("SELECT DISTINCT category FROM posts");
    const data = res.rows.map((category) => category.category);
    return Response.json({ data });
  } catch (e) {
    return new Response(`Internal Server Error: ${e}`, { status: 500 });
  } finally {
    client.release();
  }
}