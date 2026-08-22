import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { AppError } from "../middleware/errorHandler.middleware";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { signToken, sanitizeUser } from "../utils/token";
import { SanitizedUser } from "../types";

export class AuthService {
  static async register(input: RegisterInput): Promise<{ token: string; user: SanitizedUser }> {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: input.email,
      },
    });

    if (existingUser) {
      throw new AppError("An account with this email address already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    
    const fullName = `${input.firstName || ''} ${input.lastName || ''}`.trim() || 'Traveler';

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email: input.email,
        password: passwordHash,
        role: "USER", // Role is always enforced server-side
      },
    });

    const token = signToken(user);
    return { token, user: sanitizeUser(user) };
  }

  static async login(input: LoginInput): Promise<{ token: string; user: SanitizedUser }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken(user);
    return { token, user: sanitizeUser(user) };
  }

  static async getMe(userId: string): Promise<SanitizedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return sanitizeUser(user);
  }
}
