const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

const AuthService = {
  async register(input) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          ...(input.username ? [{ username: input.username }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new AppError("An account with this email address already exists", 409);
      }
      if (input.username && existingUser.username === input.username) {
        throw new AppError("This username is already taken", 409);
      }
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    // Auto-generate username if not provided
    let username = input.username;
    if (!username) {
      const emailBase = input.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      const rand = Math.floor(100 + Math.random() * 900);
      username = `${emailBase}_${rand}`;
    }

    // Split name into firstName/lastName if only name provided
    let firstName = input.firstName || "";
    let lastName = input.lastName || "";
    if (!firstName && input.name) {
      const parts = input.name.trim().split(/\s+/);
      firstName = parts[0] || "Traveler";
      lastName = parts.slice(1).join(" ") || "Explorer";
    }
    if (!firstName) firstName = "Traveler";
    if (!lastName) lastName = "Explorer";

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email: input.email,
        phone: input.phone || null,
        city: input.city || null,
        country: input.country || null,
        photo: input.photo || null,
        passwordHash,
        language: input.language || "en",
        role: "USER",
      },
    });

    const token = signToken(user);
    return { token, user: sanitizeUser(user) };
  },

  async login(input) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken(user);
    return { token, user: sanitizeUser(user) };
  },

  async getMe(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    return sanitizeUser(user);
  },
};

module.exports = { AuthService, AppError };
