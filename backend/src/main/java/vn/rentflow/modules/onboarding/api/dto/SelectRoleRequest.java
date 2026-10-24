package vn.rentflow.modules.onboarding.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import vn.rentflow.modules.users.domain.UserRole;

@Schema(description = "Yêu cầu lựa chọn vai trò trong bước đầu Onboarding")
public class SelectRoleRequest {

    @NotNull(message = "Vai trò không được để trống")
    @Schema(description = "Vai trò người dùng lựa chọn: LANDLORD hoặc TENANT (không cho phép ADMIN)", example = "LANDLORD")
    private UserRole role;

    public SelectRoleRequest() {
    }

    public SelectRoleRequest(UserRole role) {
        this.role = role;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
