import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/token.service";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        role: "admin";
      };
    }
  }
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token manquant" });
    return;
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    const payload = verifyAccessToken(token);
    req.auth = { sub: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Token invalide ou expire" });
  }
}
