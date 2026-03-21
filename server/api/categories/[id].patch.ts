import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseStatus,
} from "h3";
import type { Category } from "../../../types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { updateCategorySchema } from "../../schemas";
import { badRequest, internalError, notFound, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    setResponseStatus(event, 400);
    return badRequest("Category id is required");
  }

  const body = await readBody(event);
  const parsedBody = updateCategorySchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const updates = Object.fromEntries(
    Object.entries({
      name: parsedBody.data.name,
      description: parsedBody.data.description,
      overview: parsedBody.data.overview,
      typical_uses: parsedBody.data.typical_uses,
      buying_considerations: parsedBody.data.buying_considerations,
      featured_specs: parsedBody.data.featured_specs,
    }).filter(([, value]) => value !== undefined),
  );

  const supabase = getSupabaseAdmin();

  if (Object.keys(updates).length === 0) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      setResponseStatus(event, 500);
      return internalError(error.message);
    }

    if (!data) {
      setResponseStatus(event, 404);
      return notFound("Category not found");
    }

    return ok(
      {
        ...(data as Category),
        overview: data.overview ?? undefined,
      },
      {
        total: 1,
      },
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  if (!data) {
    setResponseStatus(event, 404);
    return notFound("Category not found");
  }

  return ok(data, {
    total: 1,
  });
});
