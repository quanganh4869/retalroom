package vn.rentflow.modules.onboarding.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import vn.rentflow.modules.identity.api.dto.UserProfileResponse;
import vn.rentflow.modules.onboarding.domain.OnboardingStatus;
import vn.rentflow.modules.users.domain.UserRole;

import java.util.UUID;

@Schema(description = "Trạng thái và tiến trình Onboarding hiện tại của người dùng")
public class OnboardingStatusResponse {

    private OnboardingStatus status;
    private String step;
    private UserRole role;
    private UserProfileResponse profile;
    private UUID propertyId;
    private String propertyName;
    private UUID roomId;
    private String roomNumber;
    private String inviteCode;
    private String accessToken; // Returned when role selection changes to issue new token with updated role authority

    public OnboardingStatusResponse() {
    }

    public OnboardingStatusResponse(OnboardingStatus status, String step, UserRole role, UserProfileResponse profile) {
        this.status = status;
        this.step = step;
        this.role = role;
        this.profile = profile;
    }

    public OnboardingStatus getStatus() {
        return status;
    }

    public void setStatus(OnboardingStatus status) {
        this.status = status;
    }

    public String getStep() {
        return step;
    }

    public void setStep(String step) {
        this.step = step;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public UserProfileResponse getProfile() {
        return profile;
    }

    public void setProfile(UserProfileResponse profile) {
        this.profile = profile;
    }

    public UUID getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(UUID propertyId) {
        this.propertyId = propertyId;
    }

    public String getPropertyName() {
        return propertyName;
    }

    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
