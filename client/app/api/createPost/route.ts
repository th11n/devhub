import { NextRequest, NextResponse } from "next/server";
import { ResourceService } from "@/lib/services/resource-service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url, category } = body;

  if (!url || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const resourceService = new ResourceService();
  const metadata = await resourceService.getMetadata(url);

  if (!metadata) {
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 502 });
  }

  const MAX_LEN = {
    title: 255,
    url: 2083,
    image: 255,
    category: 100,
  };

  const truncate = (str: string | null | undefined, max: number): string | null => {
    if (!str) return null;
    return str.length > max ? str.slice(0, max - 1) : str;
  };

  const newResource = {
    title: truncate(metadata.title, MAX_LEN.title) || "Untitled",
    body: truncate(metadata.description, 10000) || "",
    status: "awaiting" as const,
    url: truncate(url, MAX_LEN.url) || url,
    category: truncate(category, MAX_LEN.category) || "Uncategorized",
    image: truncate(metadata.image, MAX_LEN.image) || "",
  };

  try {
    const result = await resourceService.createResource(newResource);
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("DB insert error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
