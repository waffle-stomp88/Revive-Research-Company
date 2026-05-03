import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

const auth0Domain = process.env.VITE_AUTH0_DOMAIN;

let jwks: ReturnType<typeof jwksClient> | null = null;
if (auth0Domain) {
  jwks = jwksClient({
    jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
  });
}

function getSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!jwks) {
      return reject(new Error("JWKS client not initialized"));
    }
    jwks.getSigningKey(kid, (err, key) => {
      if (err || !key) return reject(err || new Error("No signing key found"));
      resolve(key.getPublicKey());
    });
  });
}

export interface Auth0TokenClaims {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  email_verified?: boolean;
}

const auth0ClientId = process.env.VITE_AUTH0_CLIENT_ID;

export async function verifyAuth0Token(token: string): Promise<Auth0TokenClaims> {
  if (!auth0Domain) {
    throw new Error("AUTH0_DOMAIN not configured");
  }
  if (!auth0ClientId) {
    throw new Error("AUTH0_CLIENT_ID not configured");
  }

  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header?.kid) {
    throw new Error("Invalid token format");
  }

  const signingKey = await getSigningKey(decoded.header.kid);

  // Verify issuer and audience (client ID) to prevent tokens issued for other
  // applications on the same Auth0 tenant from being accepted here.
  const payload = jwt.verify(token, signingKey, {
    algorithms: ["RS256"],
    issuer: `https://${auth0Domain}/`,
    audience: auth0ClientId,
  }) as Auth0TokenClaims;

  if (!payload.sub) {
    throw new Error("Token missing sub claim");
  }

  return payload;
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const claims = await verifyAuth0Token(token);
      req.user = { claims };
      req.isAuthenticated = () => true;
      return next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  const userId = (req.session as any)?.userId;
  if (userId) {
    // Populate req.user with user data so routes can access it
    const user = await storage.getUser(userId);
    if (user) {
      req.user = {
        claims: {
          sub: userId,
          email: user.email,
        }
      };
      req.isAuthenticated = () => true;
      return next();
    }
  }

  return res.status(401).json({ message: "Unauthorized" });
};

export const optionalAuth: RequestHandler = async (req, res, next) => {
  next();
};
