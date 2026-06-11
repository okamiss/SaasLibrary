import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteDocument,
  getDocument,
  getDocuments,
  reparseDocument,
  uploadDocument
} from '../api/documents';
import { useAuthStore } from '../stores/authStore';

export const documentKeys = {
  all: ['documents'] as const,
  detail: (id: string) => ['documents', id] as const
};

export function useDocumentsQuery() {
  const hasToken = useAuthStore((state) => Boolean(state.token));

  return useQuery({
    queryKey: documentKeys.all,
    queryFn: getDocuments,
    enabled: hasToken
  });
}

export function useDocumentQuery(id: string, enabled = true) {
  const hasToken = useAuthStore((state) => Boolean(state.token));

  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => getDocument(id),
    enabled: hasToken && Boolean(id) && enabled
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all })
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all })
  });
}

export function useReparseDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reparseDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all })
  });
}
