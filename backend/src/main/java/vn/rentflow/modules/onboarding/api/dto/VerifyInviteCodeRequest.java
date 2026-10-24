package vn.rentflow.modules.onboarding.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu kiểm tra mã mời phòng trọ")
public class VerifyInviteCodeRequest {

    @NotBlank(message = "Mã mời không được để trống")
    @Schema(description = "Mã mời được cấp bởi chủ nhà", example = "RF-8A92B1")
    private String inviteCode;

    public VerifyInviteCodeRequest() {
    }

    public VerifyInviteCodeRequest(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }
}
