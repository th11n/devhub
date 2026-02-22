import { auth } from "@devhub/auth";
import { env } from "@devhub/env/server";
import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { publishJSON } from "@devhub/queue";

type EnrichJob = { url: string; categoryId: string };
type LikeJob = { userId: string; resourceId: string };

const baseCfg = {
  url: process.env.RABBITMQ_URL || "amqp://dev:dev@localhost:5672",
  durable: true,
};

const enrichCfg = { ...baseCfg, queue: "resource_enrich" };
const likeCfg = { ...baseCfg, queue: "resource_like" };

new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .post("/api/submit", async ({ body, set }) => {
    try {
      const { url, categoryId } = body;

      if (!url || !categoryId) {
        set.status = 400;
        return { error: "URL and Category are required" };
      }

      const result = await publishJSON<EnrichJob>(enrichCfg, { url, categoryId });

      return {
        success: true,
        message: "Resource submitted and enriched successfully",
        data: result
      };
    } catch (error: any) {
      console.error("Submission error:", error);
      set.status = 500;
      return { success: false, error: error.message || "Internal Server Error" };
    }
  }, {
    body: t.Object({
      url: t.String(),
      categoryId: t.String()
    })
  })
  .post("/api/like", async ({ body, set }) => {
    try {
      const { userId, resourceId } = body;

      if (!userId || !resourceId) {
        set.status = 400;
        return { error: "User ID and Resource ID are required" };
      }

      const result = await publishJSON<LikeJob>(likeCfg, { userId, resourceId });

      return {
        success: true,
        message: "Like submitted successfully",
        data: result
      };
    } catch (error: any) {
      console.error("Like error:", error);
      set.status = 500;
      return { success: false, error: error.message || "Internal Server Error" };
    }
  }, {
    body: t.Object({
      userId: t.String(),
      resourceId: t.String()
    })
  })
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
