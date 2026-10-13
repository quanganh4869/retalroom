import { z } from 'zod';

export const propertySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Property name must be at least 2 characters.' })
    .max(200, { message: 'Property name cannot exceed 200 characters.' }),
  address: z
    .string()
    .min(3, { message: 'Address must be at least 3 characters.' })
    .max(300, { message: 'Address cannot exceed 300 characters.' }),
  city: z
    .string()
    .min(2, { message: 'City is required.' })
    .max(100, { message: 'City name is too long.' }),
  total_floors: z.coerce
    .number()
    .min(1, { message: 'Floors must be at least 1.' })
    .max(150, { message: 'Floors cannot exceed 150.' }),
  description: z.string().max(2000).optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  total_floors: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyListResponse {
  items: Property[];
  total: number;
  page: number;
  page_size: number;
}
