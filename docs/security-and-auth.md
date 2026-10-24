# Bảo mật & Phân quyền (Security & Authorization Guide)

## 1. Ba Vai trò Hệ thống (RBAC)

1. **ADMIN (Platform SuperAdmin):**
   - Quản trị toàn bộ nền tảng SaaS.
   - Quản lý gói cước & thuê bao của các chủ trọ.
   - Kiểm tra nhật ký kiểm toán (Audit Logs), phiên đăng nhập, cảnh báo bảo mật.
2. **LANDLORD (Chủ trọ):**
   - Quản lý cơ sở trọ, danh mục phòng, khách thuê.
   - Lập hợp đồng thuê, chốt chỉ số điện nước, phát hành hóa đơn.
   - Thu tiền phòng và quản lý chi phí vận hành.
3. **TENANT (Khách thuê):**
   - Xem hợp đồng, thông tin phòng đang thuê.
   - Tra cứu và thanh toán hóa đơn tiền phòng.
   - Gửi yêu cầu báo hỏng / sửa chữa dịch vụ.

---

## 2. Spring Security Architecture

Backend sử dụng Spring Security cấu hình Stateless REST API:
- **CSRF:** Tắt (`disable`) do ứng dụng hoạt động không lưu phiên (Stateless) trên nền HTTP Authorization Header.
- **Session:** `SessionCreationPolicy.STATELESS` — không tạo `HttpSession`.
- **Mã hóa mật khẩu:** `BCryptPasswordEncoder` (độ mạnh 10).
- **Phản hồi lỗi xác thực:** Tùy biến qua `RestAuthenticationEntryPoint` (HTTP 401 JSON) và `RestAccessDeniedHandler` (HTTP 403 JSON) đồng nhất với chuẩn `ErrorResponse`.
- **Logging bảo mật:** Tuyệt đối không log thông tin nhạy cảm (mật khẩu, refresh token, OTP, token bí mật) vào application logs.
