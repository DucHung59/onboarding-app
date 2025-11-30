import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import helloRouter from "./routes/hello.route.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:8080", // frontend URL
    credentials: true, // cho phép gửi cookie session
  })
);

// sessions
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true when https production
    httpOnly: true,
  }
}));

// routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok'})
});
app.use("/hello", helloRouter);
app.use("/auth", authRouter);

// start
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`OIDC backend: http://localhost:${PORT}`);
});
