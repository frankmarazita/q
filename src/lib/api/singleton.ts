import type { API } from "../../vendor/api";

let apiInstance: API | null = null;

export function setAPI(api: API): void {
  apiInstance = api;
}

export function getAPI(): API {
  if (!apiInstance) {
    throw new Error("API instance not initialized. Call setAPI() first.");
  }
  return apiInstance;
}
