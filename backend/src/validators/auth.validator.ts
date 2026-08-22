import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(1, "First name cannot be empty")
    .max(50, "First name too long"),
  lastName: z
    .string({ required_error: "Last name is required" })
    .trim()
    .min(1, "Last name cannot be empty")
    .max(50, "Last name too long"),
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain alphanumeric characters, underscores, and dashes")
    .transform((val) => val.toLowerCase()),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address")
    .max(255, "Email too long")
    .transform((val) => val.toLowerCase()),
  phone: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  photo: z.string().trim().optional().nullable(),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
  language: z.string().trim().default("en").optional(),
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
export type LoginInput = z.infer<typeof loginSchema>;
