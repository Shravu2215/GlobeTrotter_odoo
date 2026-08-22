import { z } from "zod";

export const createTripSchema = z
  .object({
    name: z
      .string({ required_error: "Trip name is required" })
      .trim()
      .min(1, "Trip name cannot be empty")
      .max(100, "Trip name too long"),
    description: z.string().trim().optional().nullable(),
    coverPhoto: z.string().trim().optional().nullable(),
    startDate: z.string({ required_error: "Start date is required" }).refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "Invalid start date format (must be valid ISO date)" }
    ),
    endDate: z.string({ required_error: "End date is required" }).refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "Invalid end date format (must be valid ISO date)" }
    ),
    isPublic: z.boolean().optional().default(false),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export const updateTripSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().optional().nullable(),
    coverPhoto: z.string().trim().optional().nullable(),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date format",
      })
      .optional(),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date format",
      })
      .optional(),
    isPublic: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
