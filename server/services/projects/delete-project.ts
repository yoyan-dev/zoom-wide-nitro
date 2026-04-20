import type { H3Event } from "h3";
import { deleteProjectRecord } from "../../repositories/projects/delete-project";
import { string } from "../../utils/validator";
import { getOwnedProjectOrThrow } from "./get-owned-project";
import { requireContractor } from "./require-contractor";

export async function deleteProject(
  event: H3Event,
  id: unknown,
): Promise<void> {
  const user = requireContractor(event);
  const projectId = string(id, "Project id");

  await getOwnedProjectOrThrow(user.id, projectId);
  await deleteProjectRecord(projectId);
}
