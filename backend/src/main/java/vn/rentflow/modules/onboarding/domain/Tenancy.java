package vn.rentflow.modules.onboarding.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tenancies", indexes = {
        @Index(name = "ix_tenancies_tenant_id", columnList = "tenant_id"),
        @Index(name = "ix_tenancies_room_id", columnList = "room_id")
})
public class Tenancy {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Column(name = "room_id")
    private UUID roomId;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "ACTIVE";

    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Tenancy() {
    }

    public Tenancy(UUID id, UUID tenantId, UUID propertyId, UUID roomId) {
        this.id = id != null ? id : UUID.randomUUID();
        this.tenantId = tenantId;
        this.propertyId = propertyId;
        this.roomId = roomId;
        this.status = "ACTIVE";
        this.startDate = Instant.now();
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public UUID getPropertyId() {
        return propertyId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public String getStatus() {
        return status;
    }

    public Instant getStartDate() {
        return startDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
