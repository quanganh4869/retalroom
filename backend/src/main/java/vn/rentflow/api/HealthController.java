package vn.rentflow.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.rentflow.shared.dto.ApiResponse;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "Các API kiểm tra trạng thái hoạt động của hệ thống")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/live")
    @Operation(summary = "Liveness probe", description = "Kiểm tra tiến trình ứng dụng đang chạy")
    public ResponseEntity<ApiResponse<Map<String, Object>>> liveness() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "rentflow-backend");
        return ResponseEntity.ok(ApiResponse.success("Dịch vụ đang hoạt động", status));
    }

    @GetMapping("/ready")
    @Operation(summary = "Readiness probe", description = "Kiểm tra kết nối cơ sở dữ liệu và khả năng phục vụ")
    public ResponseEntity<ApiResponse<Map<String, Object>>> readiness() {
        Map<String, Object> status = new HashMap<>();
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            status.put("database", (result != null && result == 1) ? "UP" : "DEGRADED");
            status.put("status", "UP");
            return ResponseEntity.ok(ApiResponse.success("Hệ thống sẵn sàng phục vụ", status));
        } catch (Exception e) {
            status.put("database", "DOWN");
            status.put("status", "DOWN");
            status.put("error", e.getMessage());
            return ResponseEntity.status(503).body(ApiResponse.error("Cơ sở dữ liệu chưa sẵn sàng"));
        }
    }
}
