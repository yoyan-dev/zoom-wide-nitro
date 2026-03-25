import type { MultiPartData } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { extname } from "node:path";
import { getSupabaseAdmin } from "../lib/supabase";
import { badRequestError, internalServerError } from "./errors";

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

function sanitizeFilename(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveFileExtension(part: MultiPartData) {
  const filenameExtension = part.filename ? extname(part.filename).toLowerCase() : "";

  if (filenameExtension) {
    return filenameExtension;
  }

  if (part.type && MIME_EXTENSION_MAP[part.type]) {
    return MIME_EXTENSION_MAP[part.type];
  }

  return "";
}

function ensureImagePart(part: MultiPartData) {
  if (!part.type?.startsWith("image/")) {
    throw badRequestError("image must be a valid image file");
  }
}

export async function uploadProductImage(part: MultiPartData): Promise<string> {
  ensureImagePart(part);

  const runtimeConfig = useRuntimeConfig();
  const bucket =
    runtimeConfig.supabaseProductImagesBucket ||
    process.env.SUPABASE_PRODUCT_IMAGES_BUCKET ||
    "product-images";
  const extension = resolveFileExtension(part);
  const baseName = sanitizeFilename(
    part.filename ? part.filename.replace(/\.[^.]+$/, "") : "product-image",
  );
  const objectPath = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${baseName || "image"}${extension}`;
  const supabase = getSupabaseAdmin();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, part.data, {
      contentType: part.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw internalServerError(uploadError.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  if (!data.publicUrl) {
    throw internalServerError("Unable to resolve uploaded product image URL");
  }

  return data.publicUrl;
}
