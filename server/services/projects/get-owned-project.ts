import type { Project } from "../../types";
import { getProjectByIdRecord } from "../../repositories/projects/get-project-by-id";
import { notFoundError } from "../../utils/errors";

export async function getOwnedProjectOrThrow(
  userId: string,
  projectId: string,
): Promise<Project> {
  const project = await getProjectByIdRecord(projectId);

  if (!project || project.user_id !== userId) {
    throw notFoundError("Project not found");
  }

  return project;
}
