import type { Res } from "./types";

export function createSuccessResponse<T>(data: T): Res<T> {
  return {
    status: "success",
    data,
  };
}

export function createErrorResponse(message: string): Res<never> {
  return {
    status: "error",
    message,
  };
}