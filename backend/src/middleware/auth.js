const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");

function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    next(new AppError("Invalid or expired token", 401));
  }
}

// Usage: authorize("ADMIN") or authorize("ADMIN", "USER")
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
