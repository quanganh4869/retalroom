package vn.rentflow.modules.onboarding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import vn.rentflow.modules.identity.api.dto.GoogleLoginRequest;
import vn.rentflow.modules.onboarding.api.dto.*;
import vn.rentflow.modules.users.domain.UserRole;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GoogleAuthAndOnboardingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.execute("DELETE FROM tenancies");
        jdbcTemplate.execute("DELETE FROM invitations");
        jdbcTemplate.execute("DELETE FROM audit_logs");
        jdbcTemplate.execute("DELETE FROM refresh_tokens");
        jdbcTemplate.execute("DELETE FROM rooms");
        jdbcTemplate.execute("DELETE FROM properties");
        jdbcTemplate.execute("DELETE FROM users");
    }

    @Test
    @DisplayName("Kịch bản trọn vẹn: Đăng nhập Google -> Onboarding Chủ nhà -> Tạo phòng sinh mã mời -> Khách thuê đăng nhập & chấp nhận mã mời")
    void fullGoogleLoginAndOnboardingWorkflow_success() throws Exception {
        // =====================================================================
        // 1. CHỦ NHÀ ĐĂNG NHẬP GOOGLE LẦN ĐẦU TIÊN
        // =====================================================================
        GoogleLoginRequest landlordGoogleReq = new GoogleLoginRequest("dev-google-token:landlord@rentflow.vn:Trần Văn Chủ Nhà");

        MvcResult landlordLoginResult = mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(landlordGoogleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value("landlord@rentflow.vn"))
                .andExpect(jsonPath("$.data.user.onboardingStatus").value("NOT_STARTED"))
                .andReturn();

        JsonNode landlordLoginJson = objectMapper.readTree(landlordLoginResult.getResponse().getContentAsString());
        String landlordToken = landlordLoginJson.path("data").path("accessToken").asText();
        assertThat(landlordToken).isNotBlank();

        // 2. Kiểm tra trạng thái Onboarding ban đầu
        mockMvc.perform(get("/api/v1/onboarding/status")
                        .header("Authorization", "Bearer " + landlordToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("NOT_STARTED"))
                .andExpect(jsonPath("$.data.step").value("ROLE"));

        // 3. Chủ nhà chọn vai trò LANDLORD
        SelectRoleRequest roleReq = new SelectRoleRequest(UserRole.LANDLORD);
        MvcResult roleResult = mockMvc.perform(post("/api/v1/onboarding/role")
                        .header("Authorization", "Bearer " + landlordToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("LANDLORD"))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.step").value("PROFILE"))
                .andReturn();

        JsonNode roleJson = objectMapper.readTree(roleResult.getResponse().getContentAsString());
        if (roleJson.path("data").hasNonNull("accessToken")) {
            landlordToken = roleJson.path("data").path("accessToken").asText();
        }

        // 4. Cập nhật hồ sơ cá nhân
        OnboardingProfileRequest profileReq = new OnboardingProfileRequest("Trần Văn Chủ Nhà", "0988123456");
        mockMvc.perform(post("/api/v1/onboarding/profile")
                        .header("Authorization", "Bearer " + landlordToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.step").value("PROPERTY"));

        // 5. Khởi tạo bất động sản đầu tiên
        LandlordPropertySetupRequest propertyReq = new LandlordPropertySetupRequest(
                "Nhà trọ Hoa Sen",
                "Số 123 Đường Cầu Giấy, Phường Dịch Vọng",
                "Hà Nội",
                4,
                "Tòa nhà 4 tầng khang trang"
        );
        MvcResult propResult = mockMvc.perform(post("/api/v1/onboarding/landlord/property")
                        .header("Authorization", "Bearer " + landlordToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(propertyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.step").value("MANAGEMENT_CONFIG"))
                .andExpect(jsonPath("$.data.propertyName").value("Nhà trọ Hoa Sen"))
                .andReturn();

        JsonNode propJson = objectMapper.readTree(propResult.getResponse().getContentAsString());
        UUID propertyId = UUID.fromString(propJson.path("data").path("propertyId").asText());

        // 6. Cấu hình chu kỳ thanh toán
        LandlordManagementConfigRequest configReq = new LandlordManagementConfigRequest(propertyId, 5, "MONTHLY");
        mockMvc.perform(post("/api/v1/onboarding/landlord/management-config")
                        .header("Authorization", "Bearer " + landlordToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(configReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.step").value("FIRST_ROOM"));

        // 7. Tạo phòng đầu tiên & sinh mã mời
        LandlordFirstRoomRequest roomReq = new LandlordFirstRoomRequest(
                propertyId,
                "P101",
                1,
                BigDecimal.valueOf(3500000.0),
                BigDecimal.valueOf(25.0)
        );
        MvcResult roomResult = mockMvc.perform(post("/api/v1/onboarding/landlord/first-room")
                        .header("Authorization", "Bearer " + landlordToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roomReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.step").value("CONFIRMATION"))
                .andExpect(jsonPath("$.data.roomNumber").value("P101"))
                .andExpect(jsonPath("$.data.inviteCode", startsWith("RF-")))
                .andReturn();

        JsonNode roomJson = objectMapper.readTree(roomResult.getResponse().getContentAsString());
        String generatedInviteCode = roomJson.path("data").path("inviteCode").asText();
        assertThat(generatedInviteCode).isNotBlank();

        // 8. Chủ nhà hoàn tất Onboarding
        mockMvc.perform(post("/api/v1/onboarding/landlord/complete")
                        .header("Authorization", "Bearer " + landlordToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // =====================================================================
        // 2. KHÁCH THUÊ ĐĂNG NHẬP GOOGLE & GIA NHẬP BẰNG MÃ MỜI
        // =====================================================================
        GoogleLoginRequest tenantGoogleReq = new GoogleLoginRequest("dev-google-token:tenant@rentflow.vn:Nguyễn Thị Thuê");

        MvcResult tenantLoginResult = mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tenantGoogleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.email").value("tenant@rentflow.vn"))
                .andExpect(jsonPath("$.data.user.onboardingStatus").value("NOT_STARTED"))
                .andReturn();

        JsonNode tenantLoginJson = objectMapper.readTree(tenantLoginResult.getResponse().getContentAsString());
        String tenantToken = tenantLoginJson.path("data").path("accessToken").asText();

        // 9. Khách thuê chọn vai trò TENANT
        SelectRoleRequest tenantRoleReq = new SelectRoleRequest(UserRole.TENANT);
        MvcResult tenantRoleResult = mockMvc.perform(post("/api/v1/onboarding/role")
                        .header("Authorization", "Bearer " + tenantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tenantRoleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("TENANT"))
                .andExpect(jsonPath("$.data.step").value("PROFILE"))
                .andReturn();

        JsonNode tenantRoleJson = objectMapper.readTree(tenantRoleResult.getResponse().getContentAsString());
        if (tenantRoleJson.path("data").hasNonNull("accessToken")) {
            tenantToken = tenantRoleJson.path("data").path("accessToken").asText();
        }

        // 10. Khách thuê cập nhật profile
        OnboardingProfileRequest tenantProfileReq = new OnboardingProfileRequest("Nguyễn Thị Thuê", "0901234567");
        mockMvc.perform(post("/api/v1/onboarding/profile")
                        .header("Authorization", "Bearer " + tenantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tenantProfileReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.step").value("CONNECT"));

        // 11. Khách thuê tra cứu mã mời
        mockMvc.perform(get("/api/v1/onboarding/tenant/invite-details")
                        .header("Authorization", "Bearer " + tenantToken)
                        .param("code", generatedInviteCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.propertyName").value("Nhà trọ Hoa Sen"))
                .andExpect(jsonPath("$.data.roomNumber").value("P101"))
                .andExpect(jsonPath("$.data.valid").value(true));

        // 12. Khách thuê xác nhận chấp nhận mã mời
        VerifyInviteCodeRequest acceptReq = new VerifyInviteCodeRequest(generatedInviteCode);
        mockMvc.perform(post("/api/v1/onboarding/tenant/accept-invite")
                        .header("Authorization", "Bearer " + tenantToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(acceptReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.step").value("CONFIRMATION"))
                .andExpect(jsonPath("$.data.propertyName").value("Nhà trọ Hoa Sen"))
                .andExpect(jsonPath("$.data.roomNumber").value("P101"));

        // 13. Khách thuê hoàn tất Onboarding
        mockMvc.perform(post("/api/v1/onboarding/tenant/complete")
                        .header("Authorization", "Bearer " + tenantToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }
}
