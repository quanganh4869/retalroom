package vn.rentflow.modules.identity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import vn.rentflow.modules.onboarding.domain.OnboardingStatus;
import vn.rentflow.modules.users.domain.User;
import vn.rentflow.modules.users.domain.UserRole;
import vn.rentflow.modules.users.domain.UserStatus;

import java.util.UUID;

@Schema(description = "Thông tin hồ sơ người dùng")
public class UserProfileResponse {

    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private UserRole role;
    private UserStatus status;
    private String avatarUrl;
    private String provider;
    private OnboardingStatus onboardingStatus;
    private String onboardingStep;

    public UserProfileResponse() {
    }

    public static UserProfileResponse from(User user) {
        UserProfileResponse resp = new UserProfileResponse();
        resp.id = user.getId();
        resp.email = user.getEmail();
        resp.fullName = user.getFullName();
        resp.phoneNumber = user.getPhoneNumber();
        resp.role = user.getRole();
        resp.status = user.getStatus();
        resp.avatarUrl = user.getAvatarUrl();
        resp.provider = user.getProvider();
        resp.onboardingStatus = user.getOnboardingStatus();
        resp.onboardingStep = user.getOnboardingStep();
        return resp;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getProvider() {
        return provider;
    }

    public OnboardingStatus getOnboardingStatus() {
        return onboardingStatus;
    }

    public String getOnboardingStep() {
        return onboardingStep;
    }
}
