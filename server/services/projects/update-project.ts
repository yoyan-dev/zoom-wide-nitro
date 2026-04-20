import type { H3Event } from "h3";
import type { Project } from "../../types";
import { updateProjectRecord } from "../../repositories/projects/update-project";
import { updateProjectSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { getOwnedProjectOrThrow } from "./get-owned-project";
import { requireContractor } from "./require-contractor";

export async function updateProject(
  event: H3Event,
  params: {
    id: unknown;
    input: unknown;
  },
): Promise<Project> {
  const user = requireContractor(event);
  const projectId = string(params.id, "Project id");
  const parsedInput = updateProjectSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const hasUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    return getOwnedProjectOrThrow(user.id, projectId);
  }

  await getOwnedProjectOrThrow(user.id, projectId);

  const project = await updateProjectRecord(projectId, parsedInput.data);

  if (!project) {
    throw notFoundError("Project not found");
  }

  return project;
}
