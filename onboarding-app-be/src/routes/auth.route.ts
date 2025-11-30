import { Router, Request, Response } from "express";
import crypto from "crypto";
import { createOidcClient } from "../config/oidc.js";

const router = Router();

// generate random string
function randomString(size = 32): string {
  return crypto.randomBytes(size).toString("hex");
}

// base64url encode
function base64url(input: Buffer) {
  return input.toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createCodeChallenge(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64url(hash);
}


// --------------------------------------------------------
// 1) /auth/login
// --------------------------------------------------------
router.get("/login", async (req: Request, res: Response) => {
  const client = await createOidcClient();

  const state = randomString();
  const nonce = randomString();
  const code_verifier = randomString();
  const code_challenge = createCodeChallenge(code_verifier);

  req.session.state = state;
  req.session.nonce = nonce;
  req.session.code_verifier = code_verifier;

  const url = client.authorizationUrl({
    scope: "openid profile email",
    state,
    nonce,
    code_challenge,
    code_challenge_method: "S256"
  });

  res.redirect(url);
});


// --------------------------------------------------------
// 2) /auth/callback
// --------------------------------------------------------
router.get("/callback", async (req: Request, res: Response) => {
  const client = await createOidcClient();

  try {
    const params = client.callbackParams(req);

    const tokenSet = await client.callback(
      process.env.REDIRECT_URI!,
      params,
      {
        state: req.session.state,
        nonce: req.session.nonce,
        code_verifier: req.session.code_verifier,
      }
    );

    const userinfo = await client.userinfo(tokenSet.access_token!);

    req.session.user = userinfo;

    res.redirect(process.env.POST_LOGIN_REDIRECT || "http://localhost:8080");
  }
  catch (err) {
    console.error("OIDC callback error:", err);
    res.status(500).send("Authentication failed");
  }
});


// --------------------------------------------------------
// 3) /auth/me
// --------------------------------------------------------
router.get("/me", (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: req.session.user
  });
});


// --------------------------------------------------------
// 4) /auth/logout
// --------------------------------------------------------
router.get("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect("https://52-246-136-171.sslip.io/");
  });
});



// --------------------------------------------------------
// 5) /auth/check
// --------------------------------------------------------
router.get('/check', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

export default router;
