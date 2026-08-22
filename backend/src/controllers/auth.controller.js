const { AuthService } = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");

async function signup(req, res, next) {
  try {
    const result = await AuthService.register(req.body);
    return sendSuccess(res, result, "Registration successful", 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await AuthService.login(req.body);
    return sendSuccess(res, result, "Login successful", 200);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await AuthService.getMe(req.user.id);
    return sendSuccess(res, { user }, "User retrieved successfully", 200);
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me, register: signup };
