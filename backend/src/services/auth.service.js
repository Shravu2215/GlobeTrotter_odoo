/**
 * auth.service.js — JSON File Store (no Prisma / PostgreSQL)
 *
 * Works 100% offline using backend/data/users.json.
 * If you later fix PostgreSQL credentials, swap the JSON helpers for Prisma calls.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto"); // Node built-in — no install needed

// ─── JSON store helpers ───────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, "../../data/users.json");

function readUsers() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, "[]", "utf8");
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), "utf8");
  } catch (e) {
    console.error("[JSON store] write error:", e.message);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "globetrotter_secret_key_2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// ─── AuthService ─────────────────────────────────────────────────────────────
const AuthService = {
  // ── REGISTER ───────────────────────────────────────────────────────────────
  async register(input) {
    // Validate
    if (!input.email || !input.password) {
      throw new AppError("Email and password are required", 400);
    }
    if (input.password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new AppError("Please enter a valid email address", 400);
    }

    const users = readUsers();

    if (users.find((u) => u.email === input.email)) {
      throw new AppError("An account with this email already exists", 409);
    }
    if (input.username && users.find((u) => u.username === input.username)) {
      throw new AppError("This username is already taken", 409);
    }

    // Build user object
    const passwordHash = await bcrypt.hash(input.password, 12);

    let username = input.username;
    if (!username) {
      const base = input.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      username = `${base}_${Math.floor(100 + Math.random() * 900)}`;
    }

    let firstName = input.firstName || "";
    let lastName = input.lastName || "";
    if (!firstName && input.name) {
      const parts = input.name.trim().split(/\s+/);
      firstName = parts[0] || "Traveler";
      lastName = parts.slice(1).join(" ") || "Explorer";
    }
    if (!firstName) firstName = input.email.split("@")[0] || "Traveler";
    if (!lastName) lastName = "Explorer";

    const now = new Date().toISOString();
    const newUser = {
      id: randomUUID(),
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      username,
      email: input.email,
      phone: input.phone || null,
      city: input.city || null,
      country: input.country || null,
      photo: input.photo || null,
      passwordHash,
      language: input.language || "en",
      role: "USER",
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    writeUsers(users);

    const token = signToken(newUser);
    return { token, user: sanitizeUser(newUser) };
  },

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  async login(input) {
    if (!input.email || !input.password) {
      throw new AppError("Email and password are required", 400);
    }

    const users = readUsers();
    const user = users.find((u) => u.email === input.email);
    if (!user) throw new AppError("Invalid email or password", 401);

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    const token = signToken(user);
    return { token, user: sanitizeUser(user) };
  },

  // ── GET ME ─────────────────────────────────────────────────────────────────
  async getMe(userId) {
    const users = readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new AppError("User not found", 404);
    return sanitizeUser(user);
  },

  // ── UPDATE PROFILE ─────────────────────────────────────────────────────────
  async updateProfile(userId, data) {
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new AppError("User not found", 404);

    const merged = {
      ...users[idx],
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.photo !== undefined && { photo: data.photo }),
      ...(data.language !== undefined && { language: data.language }),
      updatedAt: new Date().toISOString(),
    };
    merged.name = `${merged.firstName} ${merged.lastName}`;
    users[idx] = merged;
    writeUsers(users);
    return sanitizeUser(merged);
  },

  // ── DELETE ACCOUNT ─────────────────────────────────────────────────────────
  async deleteAccount(userId) {
    const users = readUsers();
    const filtered = users.filter((u) => u.id !== userId);
    writeUsers(filtered);
    return { message: "Account deleted successfully" };
  },
};

module.exports = { AuthService, AppError };
