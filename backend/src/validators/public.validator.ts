import { z } from "zod";

export const communityQuerySchema = z.object({
  search: z.string().trim().optional(),
  sort: z.enum(["recent", "popular"]).optional().default("recent"),
});

export type CommunityQueryInput = z.infer<typeof communityQuerySchema>;
