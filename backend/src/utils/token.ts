import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { config } from "../config/env";
import { TokenPayload, SanitizedUser } from "../types";

export function signToken(user: User): string {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

export function sanitizeUser(user: User): SanitizedUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return safeUser;
}
