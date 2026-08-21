const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { AppError } = require("../middleware/errorHandler");

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    // SECURITY FIX (from AssetFlow post-mortem):
    // role is NEVER taken from req.body. Always defaults to USER here.
    // If you need an admin-creation flow, gate it behind an existing
    // admin's authenticate + authorize("ADMIN") middleware, not signup.
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("Email already registered", 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "USER" },
    });

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid credentials", 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new AppError("Invalid credentials", 401);

    const token = signToken(user);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me };
