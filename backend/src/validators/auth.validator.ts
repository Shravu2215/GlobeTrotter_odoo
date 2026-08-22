import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().trim().optional(),
    lastName:  z.string().trim().optional(),
    name:      z.string().trim().optional(),
    username:  z.string().trim().optional(),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Invalid email address")
      .transform((val) => val.toLowerCase()),
    phone:    z.string().trim().optional().nullable(),
    city:     z.string().trim().optional().nullable(),
    country:  z.string().trim().optional().nullable(),
    photo:    z.string().trim().optional().nullable(),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
    language: z.string().trim().optional().default("en"),
  })
  .transform((data) => {
    let firstName = (data.firstName || "").trim();
    let lastName  = (data.lastName  || "").trim();

    // Handle legacy `name` field (frontend sends full name as `name`)
    if (!firstName && data.name) {
      const parts = data.name.trim().split(/\s+/);
      firstName = parts[0] ?? "Traveler";
      lastName  = parts.slice(1).join(" ") || "Explorer";
    }

    if (!firstName) firstName = "Traveler";
    if (!lastName)  lastName  = "Explorer";

    // Auto-generate username if not provided
    let username = (data.username || "").trim();
    if (!username) {
      const emailBase = data.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      const rand      = Math.floor(100 + Math.random() * 900);
      username = `${emailBase || firstName.toLowerCase()}_${rand}`;
    }

    return { ...data, firstName, lastName, username };
  });

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address")
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
