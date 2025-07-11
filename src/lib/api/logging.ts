import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (body: any) {
    const duration = Date.now() - startTime;
    const responseTimestamp = new Date().toISOString();

    // Log response based on status code
    if (res.statusCode >= 200 && res.statusCode < 300) {
      let successMessage = `[${responseTimestamp}] ${req.method} ${req.path} - Success (${duration}ms)`;
      console.log(successMessage);
    } else {
      const errorMessage = `[${responseTimestamp}] ${req.method} ${req.path} - Error: ${body.error || "Unknown error"} (${duration}ms)`;
      console.log(errorMessage);
    }

    return originalJson.call(this, body);
  };

  next();
}
