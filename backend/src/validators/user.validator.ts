import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name cannot be empty").max(50).optional(),
  lastName: z.string().trim().min(1, "Last name cannot be empty").max(50).optional(),
  email: z.string().trim().email("Invalid email address").max(255).transform((e) => e.toLowerCase()).optional(),
  phone: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  photo: z.string().trim().optional().nullable(),
  language: z.string().trim().max(10).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
