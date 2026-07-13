import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/services/api';

export function useTasks(params?: any) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksApi.getAll(params).then((r) => r.data),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useBoard(projectId: string) {
  return useQuery({
    queryKey: ['board', projectId],
    queryFn: () => tasksApi.getBoard(projectId).then((r) => r.data),
    enabled: !!projectId,
  });
}
