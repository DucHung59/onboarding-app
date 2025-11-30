import "express-session";

declare module "express-session" {
    interface SessionData {
        state?: string;
        nonce?: string;
        code_verifier?: string;
        user?: any;
    }
}


