# RentFlow — Nền tảng SaaS Quản lý Phòng trọ Thông minh

Hệ thống quản lý phòng trọ hiện đại, tinh gọn và bảo mật cao, hỗ trợ 3 vai trò người dùng chính: **Admin Nền tảng (SaaS SuperAdmin)**, **Chủ trọ (Landlord)** và **Khách thuê (Tenant)**.

Dự án áp dụng kiến trúc **Monorepo cấp repository** phân tách hoàn toàn Frontend và Backend thành hai ứng dụng độc lập, có thể cài đặt dependency, chạy, kiểm thử, build và triển khai riêng biệt.

---

## 1. Cấu trúc Tổng thể Repository

```text
rentflow/
├── frontend/             # Ứng dụng giao diện React 18, TypeScript, Vite (Feature-based)
├── backend/              # Ứng dụng máy chủ Java 17, Spring Boot 3, PostgreSQL (Modular Monolith)
├── ops/                  # Cấu hình hạ tầng Docker, init scripts PostgreSQL
├── docs/                 # Tài liệu kiến trúc, quy chuẩn REST API, schema DB, bảo mật
├── scripts/              # Các script hỗ trợ tự động hóa dev-env, test-all, build-all
├── .github/workflows/    # CI Pipeline (GitHub Actions) chạy độc lập cho Frontend và Backend
├── compose.yaml          # Điều phối Docker Compose (PostgreSQL, Backend, Frontend)
├── .env.example          # Biến môi trường mẫu điều phối hệ thống
├── .gitignore            # Khai báo loại trừ version control
├── .gitattributes        # Chuẩn hóa line-ending và định dạng tệp
├── .editorconfig         # Quy chuẩn định dạng code cho toàn đội ngũ
└── README.md             # Hướng dẫn tổng thể
```

---

## 2. Công nghệ Sử dụng

| Thành phần | Công nghệ chính |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, React Router 6, TanStack Query, Zod |
| **Backend** | Java 17 LTS, Spring Boot 3.3.4, Spring Security, Spring Data JPA, Hibernate, Actuator |
| **Cơ sở dữ liệu** | PostgreSQL 16 (H2 cho Unit/Integration Tests tự động) |
| **Migration** | Flyway (`V1__...`, `V2__...`, `V3__...`) |
| **Tài liệu API** | Springdoc OpenAPI 2.6 / Swagger UI |
| **Đóng gói & CI** | Multi-stage Docker, Docker Compose, GitHub Actions |

---

## 3. Khởi động Nhanh trong Môi trường Phát triển (Local Dev)

### Bước 1: Khởi động Cơ sở dữ liệu PostgreSQL
Bạn có thể sử dụng script có sẵn hoặc Docker Compose:
```bash
# Trên Windows PowerShell:
.\scripts\dev-env.ps1 up

# Hoặc trên Linux/macOS:
./scripts/dev-env.sh up

# Hoặc dùng trực tiếp docker compose:
docker compose up -d postgres
```
> Database PostgreSQL sẽ lắng nghe tại cổng `localhost:5432` với database `rentflow_db`.

### Bước 2: Chạy Backend (Spring Boot)
```bash
cd backend

# Chạy kiểm thử tự động (Unit & Integration tests với Flyway migration):
.\mvnw.cmd clean test

# Chạy server Backend (Profile: dev):
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```
- API Base URL: `http://localhost:8080`
- Swagger UI (Tài liệu tương tác): `http://localhost:8080/swagger-ui.html`
- Health Liveness: `http://localhost:8080/api/v1/health/live`
- Health Readiness: `http://localhost:8080/api/v1/health/ready`

### Bước 3: Chạy Frontend (React Vite)
Mở một cửa sổ terminal mới:
```bash
cd frontend

# Cài đặt thư viện nếu chưa cài:
npm install

# Khởi động máy chủ dev:
npm run dev
```
- Giao diện truy cập tại: `http://localhost:3000`

---

## 4. Kiểm tra Toàn bộ Hệ thống (Automated Testing & Build)

Hệ thống cung cấp sẵn các script hỗ trợ chạy kiểm thử và build độc lập:

- **Chạy toàn bộ kiểm thử:**
  ```powershell
  .\scripts\test-all.ps1
  ```
- **Build toàn bộ hai ứng dụng:**
  ```powershell
  .\scripts\build-all.ps1
  ```

---

## 5. Tài liệu Chi tiết
- [Kiến trúc Modular Monolith & Ranh giới Nghiệp vụ](docs/architecture.md)
- [Quy chuẩn Thiết kế RESTful API & Response Envelopes](docs/api-design.md)
- [Cơ sở Dữ liệu & Quản lý Migration bằng Flyway](docs/database-schema.md)
- [Bảo mật & Phân quyền RBAC](docs/security-and-auth.md)
- [Hạ tầng Docker & Vận hành](ops/README.md)
- [Lưu trữ mã nguồn cũ (FastAPI Archive)](legacy/backend-python/README.md)
