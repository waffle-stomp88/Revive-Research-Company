import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

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

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const userId = (req.session as any)?.userId;
  if (userId) {
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
