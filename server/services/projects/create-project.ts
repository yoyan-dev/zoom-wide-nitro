import type { H3Event } from "h3";
import type { Project } from "../../types";
import { createProjectRecord } from "../../repositories/projects/create-project";
import { createProjectSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { requireContractor } from "./require-contractor";

export async function createProject(
  event: H3Event,
  input: unknown,
): Promise<Project> {
  const user = requireContractor(event);
  const parsedInput = createProjectSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  return createProjectRecord({
    ...parsedInput.data,
    user_id: user.id,
  });
}
