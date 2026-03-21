import {
  defineEventHandler,
  readMultipartFormData,
  setResponseStatus,
} from "h3";
import type { Category } from "../../../types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { createCategorySchema } from "../../schemas";
import { parseCategoryMultipartFields } from "../../utils/category-form-data";
import { badRequest, created, internalError } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  if (!formData) {
    setResponseStatus(event, 400);
    return badRequest("multipart/form-data is required for category creation");
  }

  let body: ReturnType<typeof parseCategoryMultipartFields>;

  try {
    body = parseCategoryMultipartFields(formData);
  } catch (error) {
    setResponseStatus(event, 400);
    return badRequest(
      error instanceof Error ? error.message : "Invalid category form data",
    );
  }

  const parsedBody = createCategorySchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const supabase = getSupabaseAdmin();

  const payload = {
    name: parsedBody.data.name,
    description: parsedBody.data.description,
    overview: parsedBody.data.overview ?? null,
    typical_uses: parsedBody.data.typical_uses,
    buying_considerations: parsedBody.data.buying_considerations,
    featured_specs: parsedBody.data.featured_specs,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    setResponseStatus(event, 500);
    console.log(payload);
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
