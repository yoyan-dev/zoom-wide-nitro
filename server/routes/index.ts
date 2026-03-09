import { defineEventHandler } from "h3";

export default defineEventHandler(() => {
  return {
    service: "zoom-backend",
    status: "ok",
    message: "Construction materials ordering API is running.",
  };
});
