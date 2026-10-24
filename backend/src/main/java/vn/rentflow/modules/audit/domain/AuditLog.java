package vn.rentflow.modules.audit.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "ix_audit_logs_actor_id", columnList = "actor_id"),
        @Index(name = "ix_audit_logs_resource", columnList = "resource_type, resource_id"),
        @Index(name = "ix_audit_logs_created_at", columnList = "created_at"),
        @Index(name = "ix_audit_logs_action", columnList = "action")
})
public class AuditLog {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_email")
    private String actorEmail;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "resource_type", nullable = false, length = 100)
    private String resourceType;

    @Column(name = "resource_id", length = 100)
    private String resourceId;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "request_id", length = 100)
    private String requestId;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AuditLog() {
    }

    public AuditLog(UUID id, UUID actorId, String actorEmail, String action, String resourceType,
                    String resourceId, String status, String ipAddress, String requestId, String details) {
        this.id = id != null ? id : UUID.randomUUID();
        this.actorId = actorId;
        this.actorEmail = actorEmail;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.status = status;
        this.ipAddress = ipAddress;
        this.requestId = requestId;
        this.details = details;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getActorId() {
        return actorId;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public String getAction() {
        return action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getStatus() {
        return status;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getRequestId() {
        return requestId;
    }

    public String getDetails() {
        return details;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
