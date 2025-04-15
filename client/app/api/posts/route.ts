import { ResourceService } from "@/lib/services/resource-service";
import { NextRequest, NextResponse } from "next/server";

const REQUIRED_TOKEN = process.env.API_KEY;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ") ||
    authHeader.split(" ")[1] !== REQUIRED_TOKEN
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { title, body: content, url, category, image } = body;

  if (!title || !content || !url || !category) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const MAX_LEN = {
    title: 255,
    url: 2083,
    image: 255,
    category: 100,
  };

  function truncate(
    str: string | null | undefined,
    max: number
  ): string | null {
    if (!str) return null;
    return str.length > max ? str.slice(0, max - 1) : str;
  }

  const safeTitle = truncate(title, MAX_LEN.title);
  const safeUrl = truncate(url, MAX_LEN.url);
  const safeImage = truncate(image, MAX_LEN.image);
  const safeCategory = truncate(category, MAX_LEN.category);

  const resourceService = new ResourceService();

  try {
    const result = await resourceService.createResource({
      title: safeTitle!,
      body: content,
      url: safeUrl!,
      category: safeCategory!,
      status: 'published',
      image: safeImage || "",
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("DB insert error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
