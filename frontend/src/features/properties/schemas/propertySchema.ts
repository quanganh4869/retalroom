import { z } from 'zod';

export const propertySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Tên cơ sở phải có ít nhất 2 ký tự.' })
    .max(200, { message: 'Tên cơ sở không được vượt quá 200 ký tự.' }),
  address: z
    .string()
    .min(3, { message: 'Địa chỉ phải có ít nhất 3 ký tự.' })
    .max(300, { message: 'Địa chỉ không được vượt quá 300 ký tự.' }),
  city: z
    .string()
    .min(2, { message: 'Vui lòng chọn tỉnh / thành phố.' })
    .max(100, { message: 'Tên tỉnh / thành phố quá dài.' }),
  total_floors: z.coerce
    .number()
    .min(1, { message: 'Số tầng phải từ 1 trở lên.' })
    .max(150, { message: 'Số tầng không được vượt quá 150 tầng.' }),
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
