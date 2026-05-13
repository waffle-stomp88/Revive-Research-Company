import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      claims: {
        sub: string;
        email?: string;
        [key: string]: unknown;
      };
    };
    isAuthenticated?: () => boolean;
  }
}
