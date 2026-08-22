import prisma from "../config/prisma";
import { AppError } from "../middleware/errorHandler.middleware";
import { UpdateProfileInput } from "../validators/user.validator";
import { sanitizeUser } from "../utils/token";
import { SanitizedUser } from "../types";

export class UserService {
  static async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<SanitizedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (input.email && input.email !== user.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (emailTaken) {
        throw new AppError("Email already in use", 409);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.country !== undefined ? { country: input.country } : {}),
        ...(input.photo !== undefined ? { photo: input.photo } : {}),
        ...(input.language !== undefined ? { language: input.language } : {}),
      },
    });

    return sanitizeUser(updatedUser);
  }
}
