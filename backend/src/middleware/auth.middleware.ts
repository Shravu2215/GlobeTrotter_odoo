import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { config } from "../config/env";
import { AppError } from "./errorHandler.middleware";
import { TokenPayload } from "../types";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required: No Bearer token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err instanceof AppError) {
      return next(err);
    }
    return next(new AppError("Invalid or expired authentication token", 401));
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    req.user = decoded;
  } catch {
    // Ignore error for optional authentication
  }
  next();
}

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden: Insufficient permissions", 403));
    }
    next();
  };
}
