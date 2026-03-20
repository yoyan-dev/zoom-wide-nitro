import {
  defineEventHandler,
  readBody,
  setResponseStatus,
} from "h3";
import type { Category } from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { createCategorySchema } from "../../schemas";
import { badRequest, created, internalError } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsedBody = createCategorySchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const categoryId = `cat-${Date.now()}`;

  const payload = {
    id: categoryId,
    name: parsedBody.data.name,
    description: parsedBody.data.description,
    image_url: parsedBody.data.image_url,
    overview: parsedBody.data.overview ?? null,
    typical_uses: parsedBody.data.typical_uses,
    buying_considerations: parsedBody.data.buying_considerations,
    featured_specs: parsedBody.data.featured_specs,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  setResponseStatus(event, 201);
  return created(
    {
      ...(data as Category),
      overview: data?.overview ?? undefined,
    },
    {
    total: 1,
    },
  );
});
