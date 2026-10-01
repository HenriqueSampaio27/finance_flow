import { useEffect, useState } from "react"; 
import {Projeto2D} from '../types/projetos2d'
import { createProject, getProject, deleteProject, getProjectId, updateProjectStatus, updateProject } from "../services/projectService";


export function useProject(){
    const [project, setProject] = useState<Projeto2D[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProject = async () => {
        try {
            setLoading(true);
            setError(null);
        
            const data = await getProject();
        
            setProject(data);
            } catch (error) {
            console.error("Erro ao buscar projetos:", error);
        
            setError("Não foi possível carregar os projetos.");
            } finally {
            setLoading(false);
            }
    }

    const saveProject = async (
        project: Omit<Projeto2D, "id">
        ) => {
        try {
            setError(null);

            const response = await createProject(project);

            setProject((prev) => [
            response.project,
            ...prev,
            ]);

            return response.project;

        } catch (error) {
            console.error("Erro ao salvar projeto:", error);

            setError("Não foi possível salvar o projeto.");

            throw error;
        }
    };
    const deleteProjectId = async (id: string) => {
        try {

            setError(null);

            await deleteProject(id)

            setProject((prev) =>
                prev.filter((item) => item.id !== id)
            );

        } catch (error) {
            setError("Não foi possivel deletar projeto.")
            throw error;
        }
    };

    const editProject = async (
        id: string,
        project: Omit<Projeto2D, "id">
      ) => {
        try {
          setError(null);
    
          const response = await updateProject(id, project);
    
          setProject((prev) =>
            prev.map((item) =>
              item.id === id
                ? response.project
                : item
            )
          );
    
          return response.project;
    
        } catch (error) {
          console.error("Erro ao atualizar projeto:", error);
    
          setError("Não foi possível atualizar o projeto.");
    
          throw error;
        }
      };

    const updateStatus = async (
        id: string,
        status: string
        ) => {
        try {
            const response = await updateProjectStatus(id, status);

            setProject((prev) =>
            prev.map((item) =>
                item.id === id
                ? response.project
                : item
            )
            );

            return response;
        } catch (error) {
            console.error("Erro ao atualizar status do projeto:", error);
            throw error;
        }
        };

    useEffect(() => {
        loadProject();
      }, []);

    return {
        project,
        saveProject,
        deleteProjectId,
        updateStatus,
        loadProject,
        editProject
    }
}