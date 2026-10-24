package vn.rentflow.modules.onboarding.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "invitations", indexes = {
        @Index(name = "ix_invitations_code", columnList = "invite_code"),
        @Index(name = "ix_invitations_landlord_id", columnList = "landlord_id"),
        @Index(name = "ix_invitations_property_id", columnList = "property_id"),
        @Index(name = "ix_invitations_status", columnList = "status")
})
public class Invitation {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "landlord_id", nullable = false)
    private UUID landlordId;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Column(name = "room_id")
    private UUID roomId;

    @Column(name = "invite_code", nullable = false, unique = true, length = 50)
    private String inviteCode;

    @Column(name = "tenant_email")
    private String tenantEmail;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING";

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "accepted_by_user_id")
    private UUID acceptedByUserId;

    protected Invitation() {
    }

    public Invitation(UUID id, UUID landlordId, UUID propertyId, UUID roomId, String inviteCode, String tenantEmail, Instant expiresAt) {
        this.id = id != null ? id : UUID.randomUUID();
        this.landlordId = landlordId;
        this.propertyId = propertyId;
        this.roomId = roomId;
        this.inviteCode = inviteCode.trim().toUpperCase();
        this.tenantEmail = tenantEmail != null ? tenantEmail.trim().toLowerCase() : null;
        this.status = "PENDING";
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(this.expiresAt);
    }

    public boolean isValid() {
        return "PENDING".equalsIgnoreCase(this.status) && !isExpired();
    }

    public void accept(UUID userId) {
        this.status = "ACCEPTED";
        this.acceptedAt = Instant.now();
        this.acceptedByUserId = userId;
    }

    public void revoke() {
        this.status = "REVOKED";
    }

    public UUID getId() {
        return id;
    }

    public UUID getLandlordId() {
        return landlordId;
    }

    public UUID getPropertyId() {
        return propertyId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public String getTenantEmail() {
        return tenantEmail;
    }

    public String getStatus() {
        return status;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public UUID getAcceptedByUserId() {
        return acceptedByUserId;
    }
}
