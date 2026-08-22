const { AuthService } = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");

async function getMe(req, res, next) {
  try {
    const user = await AuthService.getMe(req.user.id);
    return sendSuccess(res, { user }, "User retrieved successfully", 200);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await AuthService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, { user }, "Profile updated successfully", 200);
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    const result = await AuthService.deleteAccount(req.user.id);
    return sendSuccess(res, result, "Account deleted successfully", 200);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, deleteMe };
