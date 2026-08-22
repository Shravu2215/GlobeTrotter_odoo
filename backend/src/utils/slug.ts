import crypto from "crypto";

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const randomString = crypto.randomBytes(3).toString("hex");
  return `${base || "trip"}-${randomString}`;
}
