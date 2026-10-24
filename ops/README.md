# RentFlow Operations & Infrastructure

Thư mục `ops/` chứa các cấu hình phục vụ phát triển cục bộ (Local Development) và hạ tầng triển khai.

## 1. Cấu trúc

- `postgres/init.sql`: Script khởi tạo PostgreSQL khi container chạy lần đầu (kích hoạt extension `uuid-ossp`).
- `docker/`: Chứa các tài nguyên Docker bổ trợ (nếu có).

## 2. Dịch vụ hạ tầng trong Development

Toàn bộ dịch vụ được điều phối bởi file `compose.yaml` ở thư mục gốc:

- **PostgreSQL 16 Alpine**: Chạy tại cổng `5432` với volume lưu trữ dữ liệu `postgres_data`.
- **Backend (Spring Boot)**: Container hóa ứng dụng Java, phụ thuộc vào health check của PostgreSQL.
- **Frontend (React)**: Nginx alpine phục vụ production bundle của giao diện người dùng.

Để khởi chạy chỉ riêng PostgreSQL phục vụ lập trình cục bộ:
```bash
docker compose up -d postgres
```
