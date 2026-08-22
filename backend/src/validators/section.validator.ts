import { z } from "zod";

export const createSectionSchema = z
  .object({
    cityId: z.string({ required_error: "City ID is required" }).uuid("Invalid city ID"),
    startDate: z.string({ required_error: "Start date is required" }).refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "Invalid start date format" }
    ),
    endDate: z.string({ required_error: "End date is required" }).refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "Invalid end date format" }
    ),
    budget: z.coerce
      .number({ required_error: "Budget is required" })
      .min(0, "Budget cannot be negative"),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export const updateSectionSchema = z
  .object({
    cityId: z.string().uuid("Invalid city ID").optional(),
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
    budget: z.coerce.number().min(0, "Budget cannot be negative").optional(),
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

export const reorderSectionsSchema = z.object({
  sectionIds: z
    .array(z.string().uuid("Invalid section ID"), {
      required_error: "sectionIds array is required",
    })
    .min(1, "sectionIds array cannot be empty"),
});

export const assignActivitySchema = z.object({
  activityId: z.string({ required_error: "Activity ID is required" }).uuid("Invalid activity ID"),
  scheduledDate: z.string({ required_error: "Scheduled date is required" }).refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Invalid scheduled date format" }
  ),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>;
export type AssignActivityInput = z.infer<typeof assignActivitySchema>;
