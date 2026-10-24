package vn.rentflow.modules.identity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu đăng nhập hoặc xác thực thông qua Google ID Token")
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID Token không được để trống")
    @Schema(description = "ID Token nhận từ Google OAuth/Identity Service", example = "eyJhbGciOiJSUzI1NiIsImtpZCI6...")
    private String idToken;

    public GoogleLoginRequest() {
    }

    public GoogleLoginRequest(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
