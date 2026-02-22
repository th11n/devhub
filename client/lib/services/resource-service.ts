import { Resource } from "@/types/resource";
import { Pool } from "@neondatabase/serverless";

export type NewResource = Omit<Resource, "id" | "created_at">;
const maxPerPage = 12;

export class ResourceService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  private async getFaviconFallback(url: string) {
    try {
      const u = new URL(url);
      return `${u.origin}/favicon.ico`;
    } catch {
      return null;
    }
  }

  async createResource(
    data: NewResource,
    isForced: boolean = false
  ): Promise<Resource> {
    const status = isForced ? "published" : "awaiting";

    try {
      const result = await this.pool.query(
        "INSERT INTO posts (title, body, status, url, category, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [data.title, data.body, status, data.url, data.category, data.image]
      );

      if (result.rows.length === 0) {
        throw new Error("No results.");
      }

      return result.rows[0] as Resource;
    } catch (error) {
      console.error("Create resource error:", error);
      throw new Error("Create resource failed");
    }
  }

  async getMetadata(url: string) {
    try {
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!res.ok) {
        console.warn(`❌ Microlink API failed: ${res.status}`);
        return null;
      }

      const json = await res.json();

      if (json.status !== "success") {
        console.warn(`❌ Microlink response not successful:`, json.status);
        return null;
      }

      const { title, description, image } = json.data;

      return {
        title: title || url,
        description: description || "",
        image: image?.url || this.getFaviconFallback(url),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.warn(`❌ Failed to fetch metadata via Microlink:`, err.message);
      return null;
    }
  }

  async getResources(
    pageParam: number,
    category: string | null,
    status: string | null
  ): Promise<{ data: Resource[]; pageCount: number }> {
    const page = isNaN(Number(pageParam)) ? 0 : Number(pageParam);
    const offset = page * maxPerPage;

    try {
      let res;
      let pageCountRes;

      if (category) {
        res = await this.pool.query(
          `SELECT * FROM posts WHERE status = $3 AND category = $2 ORDER BY id LIMIT $1 OFFSET $4`,
          [maxPerPage, category, status, offset]
        );
        pageCountRes = await this.pool.query(
          "SELECT count(id) FROM posts WHERE status=$2 AND category = $1",
          [category, status]
        );
      } else {
        res = await this.pool.query(
          `SELECT * FROM posts WHERE status=$2 ORDER BY id LIMIT $1 OFFSET $3`,
          [maxPerPage, status, offset]
        );
        pageCountRes = await this.pool.query(
          "SELECT count(id) FROM posts WHERE status=$1",
          [status]
        );
      }

      const data = res.rows;
      const totalCount = parseInt(pageCountRes.rows[0].count, 10);

      return {
        data,
        pageCount: Math.ceil(totalCount / maxPerPage),
      };
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Failed to fetch posts");
    }
  }

  async getCategories() {
    const res = await this.pool.query("SELECT DISTINCT category FROM posts");
    return res.rows.map((row) => row.category);
  }
}