# Kiến trúc Hệ thống RentFlow (Architecture Guide)

## 1. Tổng quan Kiến trúc

RentFlow áp dụng mô hình **Monorepo cấp Repository** kết hợp với **Modular Monolith** ở Backend và **Feature-Based Architecture** ở Frontend:

```text
rentflow/
├── frontend/               # React 18 + TypeScript + Vite (Feature-based)
├── backend/                # Java 17 + Spring Boot 3 + PostgreSQL (Modular Monolith)
├── ops/                    # Hạ tầng, Docker & PostgreSQL configs
├── docs/                   # Tài liệu kiến trúc, API, Database, Bảo mật
├── scripts/                # Utility scripts (dev-env, test-all, build-all)
├── .github/workflows/      # CI pipelines độc lập cho Frontend và Backend
├── compose.yaml            # Điều phối môi trường phát triển (PostgreSQL, Backend, Frontend)
└── README.md               # Tài liệu khởi động toàn dự án
```

---

## 2. Nguyên tắc Modular Monolith tại Backend (`/backend`)

Thay vì phân chia theo "layer ngang" cho toàn bộ hệ thống (dẫn đến các service khổng lồ như `UserService` hay `GeneralService`), hệ thống được tổ chức theo **Ranh giới nghiệp vụ (Business Modules)**:

```text
vn.rentflow
├── RentFlowApplication.java
├── api/                    # Health checks & shared endpoints
├── config/                 # OpenAPI, WebMvc CORS, Jackson
├── security/               # Spring Security, PasswordEncoder, Error Handlers
├── shared/                 # DTO chung (ApiResponse), Exception handling tập trung
└── modules/                # Các module nghiệp vụ độc lập
    ├── identity/           # Xác thực danh tính, JWT token (roadmap)
    ├── users/              # Tài khoản, thông tin hồ sơ
    ├── properties/         # Khu trọ, toà nhà
    ├── rooms/              # Danh mục phòng trọ (Vertical Slice hoàn chỉnh)
    │   ├── api/            # RoomController, Create/Update/Response DTOs
    │   ├── application/    # RoomService (Transactional business use cases)
    │   ├── domain/         # Room JPA Entity, RoomStatus Enum
    │   └── infrastructure/ # RoomRepository (Spring Data JPA)
    ├── tenants/            # Hồ sơ khách thuê
    ├── leases/             # Hợp đồng thuê
    ├── invoices/           # Hóa đơn & công nợ
    ├── payments/           # Giao dịch thanh toán & đối soát
    ├── subscriptions/      # Gói thuê bao SaaS nền tảng
    └── audit/              # Nhật ký kiểm toán bảo mật
```

### Quy tắc phụ thuộc giữa các module (Dependency Rules):
1. **Không phụ thuộc vòng tròn:** Module A gọi Module B thì Module B không được gọi ngược lại Module A trực tiếp.
2. **Không chọc trực tiếp vào Repository của module khác:** Nếu Module `invoices` cần thông tin `Room`, nó phải gọi qua `RoomService` hoặc Shared Read Model / Domain Event thay vì `RoomRepository`.
3. **Domain Entity không rò rỉ ra API:** Mọi Controller chỉ nhận Request DTO và trả về Response DTO, tuyệt đối không trả Entity JPA trực tiếp ra client.

---

## 3. Kiến trúc Frontend (`/frontend`)

Frontend được chia theo **Feature-Based Architecture**:
- Mỗi chức năng nghiệp vụ sở hữu các component, trang, kiểu dữ liệu và logic riêng trong thư mục `src/features/<feature-name>/`.
- Thư mục `src/shared/`:
  - `shared/api/client.ts`: HTTP client xử lý base URL, interceptor, timeout và unwrap dữ liệu an toàn.
  - `shared/config/`: Cấu hình chung của ứng dụng.
  - `shared/types/`: Kiểu dữ liệu ApiResponse, PagedResponse, ApiError đồng bộ với Backend.
