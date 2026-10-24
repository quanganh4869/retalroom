# Tiêu chuẩn Thiết kế RESTful API (API Design Guidelines)

Tất cả các API của RentFlow tuân thủ chuẩn REST với tiền tố phiên bản: `/api/v1`.

---

## 1. Cấu trúc Response chuẩn

### Phản hồi thành công (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... },
  "timestamp": "2026-10-24T01:30:00.000Z"
}
```

### Phản hồi phân trang (`PagedResponse<T>`)
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 85,
    "totalPages": 5,
    "last": false
  },
  "timestamp": "2026-10-24T01:30:00.000Z"
}
```

### Phản hồi lỗi chuẩn (`ErrorResponse`)
```json
{
  "timestamp": "2026-10-24T01:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu đầu vào không hợp lệ",
  "path": "/api/v1/rooms",
  "validationErrors": {
    "roomNumber": "Số phòng không được để trống",
    "basePrice": "Giá thuê không được âm"
  }
}
```

---

## 2. Mã trạng thái HTTP quy chuẩn

| HTTP Code | Ý nghĩa | Khi nào áp dụng |
|-----------|---------|-----------------|
| `200 OK` | Thành công | Truy vấn dữ liệu hoặc cập nhật thành công |
| `201 Created` | Đã tạo mới | Tạo tài nguyên mới (trả kèm đối tượng vừa tạo) |
| `204 No Content` | Thành công không body | Xóa tài nguyên thành công |
| `400 Bad Request` | Dữ liệu lỗi | Vi phạm validation dữ liệu hoặc quy tắc nghiệp vụ |
| `401 Unauthorized` | Chưa xác thực | Thiếu hoặc token xác thực không hợp lệ |
| `403 Forbidden` | Không có quyền | Đã đăng nhập nhưng vai trò không đủ quyền hạn |
| `404 Not Found` | Không tìm thấy | Bản ghi không tồn tại trong hệ thống |
| `409 Conflict` | Xung đột dữ liệu | Trùng lặp khóa duy nhất (unique constraint) |
| `500 Internal Server Error` | Lỗi máy chủ | Lỗi không mong muốn nội bộ (ẩn stack trace) |

---

## 3. OpenAPI / Swagger Documentation
- Tài liệu trực quan: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON Spec: `http://localhost:8080/v3/api-docs`
