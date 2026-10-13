import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProperty,
  getProperties,
  getPropertyById,
} from '@/features/properties/services/propertyService';
import { PropertyFormValues } from '@/features/properties/schemas/propertySchema';

export const PROPERTIES_QUERY_KEY = ['properties'];

export function useProperties(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, { page, pageSize }],
    queryFn: () => getProperties(page, pageSize),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: [...PROPERTIES_QUERY_KEY, id],
    queryFn: () => getPropertyById(id),
    enabled: Boolean(id),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PropertyFormValues) => createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTIES_QUERY_KEY });
    },
  });
}
