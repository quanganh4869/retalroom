package vn.rentflow.modules.identity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
}
