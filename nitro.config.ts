import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  compatibilityDate: "2026-03-09",
  srcDir: "server",
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseCategoryImagesBucket:
      process.env.SUPABASE_CATEGORY_IMAGES_BUCKET || "category-images",
  },
  routeRules: {
    "/api/**": {
      cors: true,
    },
  },
});
