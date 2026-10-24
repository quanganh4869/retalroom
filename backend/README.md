# RentFlow Enterprise Backend

Dịch vụ Backend cho nền tảng quản lý phòng trọ **RentFlow (SaaS)**, xây dựng theo kiến trúc **Modular Monolith** bằng Java 17, Spring Boot 3 và PostgreSQL.

---

## 1. Công nghệ & Thư viện chủ đạo

- **Ngôn ngữ:** Java 17 LTS (hỗ trợ Java 21)
- **Framework:** Spring Boot 3.3.4 (Spring Web, Spring Security, Spring Data JPA, Spring Validation, Actuator)
- **Cơ sở dữ liệu:** PostgreSQL 16 (H2 cho Unit/Integration Test)
- **Quản lý Database Migration:** Flyway (`classpath:db/migration`)
- **Tài liệu API:** Springdoc OpenAPI / Swagger UI (`/swagger-ui.html`)
- **Build tool:** Apache Maven 3.9+ & Maven Wrapper (`./mvnw`)

---

## 2. Cấu trúc thư mục Modular Monolith

```text
backend/
├── src/
│   ├── main/
│   │   ├── java/vn/rentflow/
│   │   │   ├── RentFlowApplication.java
│   │   │   ├── api/                     # Health check, shared web endpoints
│   │   │   ├── config/                  # OpenAPI, WebMvc CORS, Jackson
│   │   │   ├── security/                # Spring Security, PasswordEncoder, Error Handlers
│   │   │   ├── shared/                  # DTO chung (ApiResponse, PagedResponse), Exception Handling
│   │   │   └── modules/                 # Ranh giới nghiệp vụ (Business Modules)
│   │   │       └── rooms/               # Vertical slice mẫu hoàn chỉnh:
│   │   │           ├── api/             # RoomController, DTOs (Create, Update, Response)
│   │   │           ├── application/     # RoomService (Transactional use cases)
│   │   │           ├── domain/          # Room Entity, RoomStatus Enum
│   │   │           └── infrastructure/  # RoomRepository (Spring Data JPA)
│   │   └── resources/
│   │       ├── application.yml          # Cấu hình gốc
│   │       ├── application-dev.yml      # Môi trường Local Dev (PostgreSQL)
│   │       ├── application-test.yml     # Môi trường Test (H2 in PostgreSQL mode + Flyway)
│   │       ├── application-prod.yml     # Môi trường Production
│   │       ├── logback-spring.xml       # Cấu hình log có cấu trúc
│   │       └── db/migration/            # Flyway SQL migrations (V1, V2, V3...)
│   └── test/                            # Unit & Integration Tests (MockMvc, Data layer)
├── Dockerfile                           # Multi-stage Docker build
├── pom.xml                              # Maven Project Object Model
├── mvnw / mvnw.cmd                      # Maven Wrapper scripts
└── README.md
```

---

## 3. Khởi chạy và kiểm thử

### Chạy kiểm thử tự động (Unit & Integration Tests)
```bash
./mvnw clean test
# Hoặc trên Windows PowerShell:
.\mvnw.cmd clean test
```

### Chạy ứng dụng môi trường Development
```bash
# Đảm bảo PostgreSQL đang chạy (qua Docker compose hoặc cài trực tiếp)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Swagger UI & Health Check
- Swagger API Docs: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON Spec: `http://localhost:8080/v3/api-docs`
- Health Liveness: `http://localhost:8080/api/v1/health/live`
- Health Readiness: `http://localhost:8080/api/v1/health/ready`
