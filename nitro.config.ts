import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  compatibilityDate: "2026-03-09",
  srcDir: "server",
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseCategoryImagesBucket:
      process.env.SUPABASE_CATEGORY_IMAGES_BUCKET || "category-images",
    supabaseProductImagesBucket:
      process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images",
  },
  routeRules: {
    "/api/**": {
      cors: true,
    },
  },
});
