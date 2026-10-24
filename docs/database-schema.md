# Cơ sở Dữ liệu & Quy trình Migration (Database Guide)

## 1. Cơ chế Quản lý Schema

RentFlow sử dụng **Flyway** làm công cụ quản lý schema duy nhất cho cơ sở dữ liệu PostgreSQL.

- **Vị trí migration:** `backend/src/main/resources/db/migration/`
- **Quy chuẩn đặt tên:** `V<version>__<description>.sql`
- **Nguyên tắc bất biến:** Không bao giờ sửa đổi một file migration đã được áp dụng vào môi trường dùng chung (Dev/Staging/Production). Mọi thay đổi đều phải tạo file migration mới có số thứ tự tăng dần.
- **Cấu hình Hibernate:** 
  - Local Dev & Prod: `spring.jpa.hibernate.ddl-auto: validate` để đảm bảo JPA entities khớp 100% với schema do Flyway tạo ra.

---

## 2. Danh mục Migration ban đầu

### `V1__create_users_table.sql`
- Bảng `users`: Lưu trữ tài khoản người dùng của toàn hệ thống (SuperAdmin, Chủ trọ, Khách thuê).
- Khóa chính: `UUID`
- Khóa duy nhất: `email`
- Đánh chỉ mục: `email`, `role`, `status`

### `V2__create_properties_table.sql`
- Bảng `properties`: Cơ sở, toà nhà, khu nhà trọ do chủ trọ (`landlord_id`) quản lý.
- Khóa ngoại: `landlord_id REFERENCES users(id) ON DELETE CASCADE`
- Đánh chỉ mục: `landlord_id`, `name`

### `V3__create_rooms_table.sql`
- Bảng `rooms`: Danh mục phòng trọ trực thuộc từng cơ sở.
- Khóa ngoại: `property_id REFERENCES properties(id) ON DELETE CASCADE`
- Khóa duy nhất: `(property_id, room_number)` — chống trùng lặp số phòng trong cùng một cơ sở.
- Các cột tài chính: `base_price NUMERIC(15, 2)` (chuẩn xác cho VNĐ, không làm tròn sai số float/double).
- Đánh chỉ mục: `property_id`, `status`
