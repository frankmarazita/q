import type { Res } from "./types";

export function successRes<T>(data: T): Res<T> {
  return {
    status: "success",
    data,
  };
}

export function errorRes(message: string): Res<never> {
  return {
    status: "error",
    message,
  };
}
