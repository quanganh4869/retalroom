package vn.rentflow.modules.onboarding.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết của lời mời tham gia phòng trọ")
public class InvitationDetailsResponse {

    private UUID invitationId;
    private String inviteCode;
    private UUID propertyId;
    private String propertyName;
    private String propertyAddress;
    private UUID roomId;
    private String roomNumber;
    private String landlordName;
    private Instant expiresAt;
    private boolean valid;

    public InvitationDetailsResponse() {
    }

    public InvitationDetailsResponse(UUID invitationId, String inviteCode, UUID propertyId, String propertyName,
                                     String propertyAddress, UUID roomId, String roomNumber,
                                     String landlordName, Instant expiresAt, boolean valid) {
        this.invitationId = invitationId;
        this.inviteCode = inviteCode;
        this.propertyId = propertyId;
        this.propertyName = propertyName;
        this.propertyAddress = propertyAddress;
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.landlordName = landlordName;
        this.expiresAt = expiresAt;
        this.valid = valid;
    }

    public UUID getInvitationId() {
        return invitationId;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public UUID getPropertyId() {
        return propertyId;
    }

    public String getPropertyName() {
        return propertyName;
    }

    public String getPropertyAddress() {
        return propertyAddress;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public String getLandlordName() {
        return landlordName;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isValid() {
        return valid;
    }
}
