import { apiRequest } from "./apiRequest";
import { Projeto2D } from "../types/projetos2d";

export async function getProject(): Promise<Projeto2D[]> {
  return apiRequest<Projeto2D[]>("/project");
}

export async function getProjectId(id: number): Promise<Projeto2D> {
  return apiRequest<Projeto2D>(`/project/${id}`);
}

export async function createProject(
  project: Omit<Projeto2D, "id">
): Promise<{
  message: string;
  project: Projeto2D;
}> {
  return apiRequest<{
    message: string;
    project: Projeto2D;
  }>("/project", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export async function updateProject(
  id: string,
  project: Omit<Projeto2D, "id">
): Promise<{ message: string; project: Projeto2D }> {
  return apiRequest<{ message: string; project: Projeto2D }>(
    `/project/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(project),
    }
  );
}

export async function updateProjectStatus(
  id: string,
  status: string
): Promise<{
  message: string;
  project: Projeto2D;
}> {
  return apiRequest<{
    message: string;
    project: Projeto2D;
  }>(`/project/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function deleteProject(
  id: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/project/${id}`, {
    method: "DELETE",
  });
}