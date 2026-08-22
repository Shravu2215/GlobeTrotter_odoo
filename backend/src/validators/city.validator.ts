import { z } from "zod";
import { ActivityType, ActivityCategory } from "@prisma/client";

export const cityQuerySchema = z.object({
  search: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export const activityQuerySchema = z.object({
  type: z.nativeEnum(ActivityType).optional(),
  category: z.nativeEnum(ActivityCategory).optional(),
  maxCost: z.coerce.number().min(0).optional(),
});

export type CityQueryInput = z.infer<typeof cityQuerySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
