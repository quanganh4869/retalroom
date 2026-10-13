import { apiClient } from '@/services/api/client';
import {
  Property,
  PropertyFormValues,
  PropertyListResponse,
} from '@/features/properties/schemas/propertySchema';

export async function getProperties(page = 1, pageSize = 20): Promise<PropertyListResponse> {
  return apiClient<PropertyListResponse>(`/api/v1/properties?page=${page}&page_size=${pageSize}`);
}

export async function getPropertyById(id: string): Promise<Property> {
  return apiClient<Property>(`/api/v1/properties/${id}`);
}

export async function createProperty(data: PropertyFormValues): Promise<Property> {
  return apiClient<Property>('/api/v1/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
