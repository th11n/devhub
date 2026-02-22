import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import { cacheDelPattern } from "@devhub/redis";
import puppeteer, { type Page } from "puppeteer";
import sharp from "sharp";
import { sanityClient } from "../../server/src/sanity";

function isProbablyHtml(buf: Buffer) {
    const head = buf.subarray(0, 512).toString("utf8").toLowerCase();
    return (
        head.includes("<!doctype") ||
        head.includes("<html") ||
        head.includes("<head") ||
        head.includes("<body")
    );
}

function parseDataUrl(dataUrl: string) {
    const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) return null;
    const contentType = m[1];
    const base64Data = m[2];
    if (!contentType || !base64Data) return null;

    return {
        contentType: contentType.toLowerCase(),
        buffer: Buffer.from(base64Data, "base64"),
    };
}

async function fetchImageAsPng(
    urlOrData: string,
): Promise<{ buffer: Buffer; filename: string; contentType: string } | null> {
    if (!urlOrData) return null;

    if (urlOrData.startsWith("data:")) {
        const parsed = parseDataUrl(urlOrData);
        if (!parsed) return null;

        try {
            const png = await sharp(parsed.buffer, { failOnError: false })
                .png()
                .toBuffer();
            return { buffer: png, filename: "logo.png", contentType: "image/png" };
        } catch {
            return null;
        }
    }

    try {
        const resp = await fetch(urlOrData, {
            redirect: "follow",
            headers: {
                Accept:
                    "image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8",
                "User-Agent": "Mozilla/5.0",
            },
        });

        if (!resp.ok) return null;

        const contentType = (resp.headers.get("content-type") || "").toLowerCase();
        const buf = Buffer.from(await resp.arrayBuffer());

        if (contentType.includes("text/html") || isProbablyHtml(buf)) return null;

        const png = await sharp(buf, { failOnError: false }).png().toBuffer();
        return { buffer: png, filename: "logo.png", contentType: "image/png" };
    } catch (err) {
        console.error(`[enrichment] fetchImageAsPng error for ${urlOrData}:`, err);
        return null;
    }
}

async function pickFaviconUrl(page: Page): Promise<string> {
    const href = (await page.evaluate(() => {
        const links = Array.from(
            document.querySelectorAll<HTMLLinkElement>(
                'link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
            ),
        );

        const candidates = links
            .map((l) => {
                const href = l.getAttribute("href") || "";
                const sizes = (l.getAttribute("sizes") || "").toLowerCase();
                const type = (l.getAttribute("type") || "").toLowerCase();

                const sizeScore = sizes.includes("x")
                    ? Number.parseInt(sizes.split("x")[0] || "0", 10)
                    : 0;

                const pngBonus =
                    href.toLowerCase().includes(".png") || type.includes("png")
                        ? 1000
                        : 0;
                const svgPenalty =
                    href.toLowerCase().includes(".svg") || type.includes("svg")
                        ? -500
                        : 0;

                return { href, score: pngBonus + sizeScore + svgPenalty };
            })
            .filter((x) => x.href);

        candidates.sort((a, b) => b.score - a.score);

        return candidates[0]?.href || "/favicon.ico";
    })) as string;

    return href;
}

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function enrichResource(url: string, categoryId: string) {
    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        headless: true,
        args: [
            "--headless=new",
            "--disable-gpu",
            "--disable-software-rasterizer",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-zygote",
            "--single-process",
        ],
    }); const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        const title = await page.title();

        const description = (await page.evaluate(() => {
            const getMeta = (name: string) =>
                document
                    .querySelector(`meta[name="${name}"]`)
                    ?.getAttribute("content") ||
                document
                    .querySelector(`meta[property="${name}"]`)
                    ?.getAttribute("content") ||
                document
                    .querySelector(`meta[property="og:${name}"]`)
                    ?.getAttribute("content");

            return getMeta("description") || getMeta("og:description") || "";
        })) as string;

        const faviconHref = await pickFaviconUrl(page);
        const absoluteFaviconUrl = new URL(faviconHref, url).toString();

        const screenshotBuffer = Buffer.from(
            await page.screenshot({
                type: "jpeg",
                quality: 80,
            }),
        );

        console.log("Uploading assets to Sanity...");

        let previewImageRef: any = null;
        if (screenshotBuffer.length > 0) {
            const asset = await sanityClient.assets.upload(
                "image",
                screenshotBuffer,
                {
                    filename: "preview.jpg",
                    contentType: "image/jpeg",
                },
            );
            previewImageRef = {
                _type: "image",
                asset: { _type: "reference", _ref: asset._id },
            };
        }

        let logoRef: any = null;
        const normalizedLogo = await fetchImageAsPng(absoluteFaviconUrl);

        if (normalizedLogo) {
            const asset = await sanityClient.assets.upload(
                "image",
                normalizedLogo.buffer,
                {
                    filename: normalizedLogo.filename,
                    contentType: normalizedLogo.contentType,
                },
            );
            logoRef = {
                _type: "image",
                asset: { _type: "reference", _ref: asset._id },
            };
        } else {
            console.warn(
                `No valid favicon/logo found at ${absoluteFaviconUrl} (skipping logo).`,
            );
        }

        const baseName = title?.trim() ? title : url;
        const slug = slugify(baseName) || slugify(new URL(url).hostname);

        const doc = {
            _type: "resource",
            name: baseName,
            slug: { _type: "slug", current: slug },
            description: description || "",
            link: url,
            status: "review",
            previewImage: previewImageRef,
            logo: logoRef,
            categories: [
                {
                    _type: "reference",
                    _ref: categoryId,
                    _key: crypto.randomUUID(),
                },
            ],
            publishedAt: new Date().toISOString(),
        };

        const result = await sanityClient.create(doc);
        console.log("Resource created in Sanity:", result._id);

        // Invalidate all sanity caches to refresh main feed
        await cacheDelPattern("sanity:*");

        return result;
    } catch (err) {
        console.error(`[enrichment] Error enriching ${url}:`, err);
        throw err;
    } finally {
        await page.close().catch(() => { });
        await browser.close().catch(() => { });
    }
}
