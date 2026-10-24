package vn.rentflow.modules.audit.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.rentflow.modules.audit.domain.AuditLog;
import vn.rentflow.modules.audit.infrastructure.persistence.AuditLogRepository;
import vn.rentflow.observability.RequestContext;
import vn.rentflow.shared.dto.PagedResponse;

import java.util.UUID;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(UUID actorId, String actorEmail, String action, String resourceType,
                       String resourceId, String status, String details) {
        try {
            AuditLog auditLog = new AuditLog(
                    UUID.randomUUID(),
                    actorId,
                    actorEmail,
                    action,
                    resourceType,
                    resourceId,
                    status,
                    RequestContext.getClientIp(),
                    RequestContext.getRequestId(),
                    details
            );
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to record audit log for action {}: {}", action, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLog> listAuditLogs(Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAll(pageable);
        return PagedResponse.from(page);
    }
}
