import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

type TargetSource = "body" | "query" | "params";

export function validate(schema: AnyZodObject, source: TargetSource = "body") {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(error);
      }
      next(error);
    }
  };
}
