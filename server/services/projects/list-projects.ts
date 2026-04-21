import type { H3Event } from "h3";
import type { Project } from "../../types";
import { listProjectRecords } from "../../repositories/projects/list-projects";
import { requireContractor } from "./require-contractor";

export async function listProjects(event: H3Event): Promise<Project[]> {
  const user = requireContractor(event);
  return listProjectRecords(user.id);
}
