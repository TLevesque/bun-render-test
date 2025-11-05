import { resolve, join } from "path";
import { existsSync } from "fs";

// Render.com provides PORT via environment variable
// MUST bind to 0.0.0.0, not localhost!
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // ← CRITICAL: Must be 0.0.0.0 for Render
const NODE_ENV = process.env.NODE_ENV || "production";

const API_PREFIX = process.env.API_PREFIX || "/api";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const pagesDir = resolve("./pages");
const apiDir = resolve("./api");

// Logger utility
const logger = {
  info: (...args) => console.log(`[INFO]`, new Date().toISOString(), ...args),
  error: (...args) =>
    console.error(`[ERROR]`, new Date().toISOString(), ...args),
  warn: (...args) => console.warn(`[WARN]`, new Date().toISOString(), ...args),
  debug: (...args) => {
    if (NODE_ENV === "development") {
      console.log(`[DEBUG]`, new Date().toISOString(), ...args);
    }
  },
};

// Helper function to load page modules
async function loadPage(pathname) {
  pathname = pathname === "/" ? "/index" : pathname;
  pathname = pathname.split("?")[0];

  const pagePath = join(pagesDir, `${pathname}.js`);

  if (existsSync(pagePath)) {
    try {
      const module = await import(`${pagePath}?t=${Date.now()}`);
      return module.default;
    } catch (error) {
      logger.error(`Error loading page: ${pagePath}`, error.message);
      return null;
    }
  }

  return null;
}

// Helper function to load API handlers
async function loadApiHandler(pathname) {
  pathname = pathname.replace(new RegExp(`^${API_PREFIX}`), "");
  pathname = pathname.split("?")[0];

  const apiPath = join(apiDir, `${pathname}.js`);

  if (existsSync(apiPath)) {
    try {
      const module = await import(`${apiPath}?t=${Date.now()}`);
      return module.default;
    } catch (error) {
      logger.error(`Error loading API handler: ${apiPath}`, error.message);
      return null;
    }
  }

  return null;
}

// CORS headers
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Create the server
const server = Bun.serve({
  port: PORT,
  hostname: HOST,

  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    // Log request in development
    logger.debug(`${method} ${pathname}`);

    // Handle OPTIONS for CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    // Serve static files from public directory
    if (pathname.startsWith("/public/")) {
      try {
        const filePath = join(process.cwd(), pathname);
        const file = Bun.file(filePath);

        if (await file.exists()) {
          return new Response(file, {
            headers: {
              "Cache-Control":
                NODE_ENV === "production"
                  ? "public, max-age=31536000"
                  : "no-cache",
            },
          });
        }
      } catch (error) {
        logger.error("Static file error:", error.message);
      }
    }

    // Handle favicon
    if (pathname === "/favicon.ico") {
      return new Response("", { status: 404 });
    }

    // Health check endpoint
    if (pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          environment: NODE_ENV,
          uptime: process.uptime(),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(),
          },
        }
      );
    }

    // Handle API routes
    if (pathname.startsWith(API_PREFIX)) {
      const handler = await loadApiHandler(pathname);

      if (handler) {
        try {
          const response = await handler(req);

          // Add CORS headers to API responses
          const headers = new Headers(response.headers);
          Object.entries(getCorsHeaders()).forEach(([key, value]) => {
            headers.set(key, value);
          });

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        } catch (error) {
          logger.error("API Error:", error);
          return new Response(
            JSON.stringify({
              error: "Internal Server Error",
              message:
                NODE_ENV === "development"
                  ? error.message
                  : "An error occurred",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...getCorsHeaders(),
              },
            }
          );
        }
      }

      // API endpoint not found
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: `API endpoint ${pathname} does not exist`,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(),
          },
        }
      );
    }

    // Load and render page
    const page = await loadPage(pathname);

    if (page) {
      try {
        const html = page(req);
        return new Response(html, {
          headers: {
            "Content-Type": "text/html",
            "Cache-Control":
              NODE_ENV === "production" ? "public, max-age=3600" : "no-cache",
          },
        });
      } catch (error) {
        logger.error("Page render error:", error);
        return new Response(
          `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>500 - Server Error</title>
            <link rel="stylesheet" href="/public/styles.css">
          </head>
          <body>
            <div class="container">
              <div class="card">
                <h1>500</h1>
                <p>Internal Server Error</p>
                ${
                  NODE_ENV === "development"
                    ? `<pre>${error.message}</pre>`
                    : ""
                }
                <a href="/" class="button">Go back home</a>
              </div>
            </div>
          </body>
          </html>
          `,
          {
            status: 500,
            headers: {
              "Content-Type": "text/html",
            },
          }
        );
      }
    }

    // 404 page
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Page Not Found</title>
        <link rel="stylesheet" href="/public/styles.css">
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1>404</h1>
            <p>Page not found</p>
            <a href="/" class="button">Go back home</a>
          </div>
        </div>
      </body>
      </html>
      `,
      {
        status: 404,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  },

  // Error handler
  error(error) {
    logger.error("Server error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message:
          NODE_ENV === "development" ? error.message : "An error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  },
});

console.log(`🚀 Server running on http://${HOST}:${PORT}`);
console.log(`📁 Pages directory: ${pagesDir}`);
console.log(`🔌 API directory: ${apiDir}`);
console.log(`🌍 Environment: ${NODE_ENV}`);
console.log(`🎯 Health check available at: http://${HOST}:${PORT}/health`);

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Shutting down gracefully...");
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Shutting down gracefully...");
  server.stop();
  process.exit(0);
});
