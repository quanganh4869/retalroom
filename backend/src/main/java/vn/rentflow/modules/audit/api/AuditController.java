package vn.rentflow.modules.audit.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.rentflow.modules.audit.application.AuditService;
import vn.rentflow.modules.audit.domain.AuditLog;
import vn.rentflow.shared.dto.ApiResponse;
import vn.rentflow.shared.dto.PagedResponse;

@RestController
@RequestMapping("/api/v1/audit-logs")
@Tag(name = "Audit Logs", description = "Truy vấn nhật ký kiểm toán và sự kiện bảo mật (Dành cho Quản trị viên)")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "Danh sách nhật ký kiểm toán", description = "Tra cứu toàn bộ hành động nghiệp vụ quan trọng trong hệ thống")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAuditLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<AuditLog> logs = auditService.listAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
