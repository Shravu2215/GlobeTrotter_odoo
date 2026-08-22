import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler.middleware";
import { config } from "./config/env";

export function createApp(): Express {
  const app = express();

  // Security Middleware
  app.use(helmet());

  // CORS Middleware
  app.use(
    cors({
      origin: [config.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Logging
  if (config.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Welcome / Root Endpoint
  app.get("/", (req, res) => {
    res.json({
      success: true,
      name: "GlobeTrotter API",
      version: "1.0.0",
      status: "online",
      healthCheck: "/api/health",
      endpoints: {
        auth: "/api/auth",
        trips: "/api/trips",
        sections: "/api/sections",
        cities: "/api/cities",
        public: "/api/public",
        admin: "/api/admin",
      },
    });
  });

  // API Routes
  app.use("/api", routes);

  // Error Handlers
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
