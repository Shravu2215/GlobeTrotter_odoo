const express = require("express");
const { signup, login, me } = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../utils/schemas");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

module.exports = router;
