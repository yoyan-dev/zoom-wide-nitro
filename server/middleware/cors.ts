import { defineEventHandler, setResponseHeaders } from "h3";

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  // Handle preflight request
  if (event.node.req.method === "OPTIONS") {
    event.node.res.statusCode = 204;
    event.node.res.end();
  }
});
