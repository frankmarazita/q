import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import type { ErrorRes } from "./types";

export function validateReq<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = schema.safeParse(req.body);

      if (!validation.success) {
        const errorMessage = validation.error.issues
          .map((issue) => issue.message)
          .join(", ");

        const errorRes: ErrorRes = {
          error: errorMessage,
        };

        res.status(400).json(errorRes);
        return;
      }

      req.body = validation.data;
      next();
    } catch (_error) {
      const errorRes: ErrorRes = {
        error: "Invalid request format",
      };

      res.status(400).json(errorRes);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = schema.safeParse(req.params);

      if (!validation.success) {
        const errorMessage = validation.error.issues
          .map((issue) => issue.message)
          .join(", ");

        const errorRes: ErrorRes = {
          error: errorMessage,
        };

        res.status(400).json(errorRes);
        return;
      }

      // Type assertion since we know validation passed
      req.params = validation.data as any;
      next();
    } catch (_error) {
      const errorRes: ErrorRes = {
        error: "Invalid request format",
      };

      res.status(400).json(errorRes);
    }
  };
}
