import express from "express";
import path from "path";
import app, { getAIClient, generateGeminiContentWithFallback } from "./api/index";

const PORT = 3000;

async function startServer() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`InflowPK server running on http://0.0.0.0:${PORT}`);
  });
}

// In Vercel serverless environment (VERCEL or VERCEL_ENV), Vercel invokes the exported app directly
if (!process.env.VERCEL && !process.env.VERCEL_ENV && !process.env.NOW_REGION) {
  startServer();
}

export { app, getAIClient, generateGeminiContentWithFallback };
export default app;
