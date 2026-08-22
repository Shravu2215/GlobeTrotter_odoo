const { z } = require("zod");

const signupSchema = z
  .object({
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    name: z.string().trim().optional(),
    username: z.string().trim().optional(),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Invalid email address")
      .transform((val) => val.toLowerCase()),
    phone: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    country: z.string().trim().optional().nullable(),
    photo: z.string().trim().optional().nullable(),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
    language: z.string().trim().default("en").optional(),
  })
  .transform((data) => {
    let firstName = data.firstName || "";
    let lastName = data.lastName || "";

    if (!firstName && data.name) {
      const parts = data.name.trim().split(" ");
      firstName = parts[0] || "User";
      lastName = parts.slice(1).join(" ") || "Traveler";
    }

    if (!firstName) firstName = "Traveler";
    if (!lastName) lastName = "Explorer";

    let username = data.username;
    if (!username) {
      const emailBase = data.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      username = `${emailBase || firstName.toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`;
    }

    return {
      ...data,
      firstName,
      lastName,
      username,
    };
  });

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address")
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

module.exports = { signupSchema, loginSchema, registerSchema: signupSchema };