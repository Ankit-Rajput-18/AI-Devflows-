import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/services/api';

export function useProjects(params?: any) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.getAll(params).then((r) => r.data),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}
