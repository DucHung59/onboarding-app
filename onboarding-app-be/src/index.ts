import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import helloRouter from "./routes/hello.route.js";
import appInsights from 'applicationinsights';

if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setSendLiveMetrics(true)
    .setAutoCollectRequests(false)  // tắt auto-collect, dùng middleware thủ công
    .setAutoCollectPerformance(true, true)
    .setAutoCollectDependencies(true)
    .setAutoCollectExceptions(true)
    .start();

  console.log("App Insights initialized");
}

const app = express();

// Trust proxy để lấy đúng original URL từ reverse proxy/load balancer
app.set('trust proxy', true);

app.use(express.json());

// Middleware để track requests cho Live Metrics
// Đặt middleware này sớm để track tất cả requests
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  app.use((req, res, next) => {
    const start = Date.now();
    const client = appInsights.defaultClient;

    // Lưu original URL để track đúng
    const originalUrl = req.originalUrl || req.url;
    const method = req.method;

    // Track request khi response hoàn thành
    res.on("finish", () => {
      if (client) {
        const duration = Date.now() - start;
        const requestName = `${method} ${originalUrl}`;

        client.trackRequest({
          name: requestName,
          url: originalUrl,
          duration: duration,
          resultCode: res.statusCode.toString(),
          success: res.statusCode < 400,
          properties: {
            method: method,
            route: req.route?.path || originalUrl,
            path: originalUrl,
            userAgent: req.get('user-agent') || 'unknown',
          }
        });
      }
    });

    next();
  });
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8080", // frontend URL
    credentials: true, // cho phép gửi cookie session
  })
);

// sessions
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // set true when https production
    httpOnly: true,
  }
}));

// routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
});
app.use("/hello", helloRouter);
app.use("/auth", authRouter);

// start
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`OIDC backend: http://localhost:${PORT}`);
});
