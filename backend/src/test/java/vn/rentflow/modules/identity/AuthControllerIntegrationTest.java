package vn.rentflow.modules.identity;

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
import vn.rentflow.modules.identity.api.dto.LoginRequest;
import vn.rentflow.modules.identity.api.dto.RefreshTokenRequest;
import vn.rentflow.modules.identity.api.dto.RegisterRequest;
import vn.rentflow.modules.users.domain.UserRole;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

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
    @DisplayName("Quy trình xác thực đầu cuối: Đăng ký -> Đăng nhập -> Gọi API bảo mật -> Xoay vòng Refresh Token -> Đăng xuất")
    void fullAuthWorkflow_success() throws Exception {
        // 1. Đăng ký tài khoản Chủ trọ mới
        RegisterRequest registerReq = new RegisterRequest(
                "chutro.test@rentflow.vn",
                "ChutroSecret123!",
                "Trần Văn Chủ Trọ",
                "0987654321",
                UserRole.LANDLORD
        );

        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("chutro.test@rentflow.vn")))
                .andExpect(jsonPath("$.data.user.role", is("LANDLORD")))
                .andReturn();

        JsonNode registerJson = objectMapper.readTree(registerResult.getResponse().getContentAsString());
        String initialRefreshToken = registerJson.get("data").get("refreshToken").asText();

        // 2. Đăng nhập với tài khoản vừa đăng ký
        LoginRequest loginReq = new LoginRequest("chutro.test@rentflow.vn", "ChutroSecret123!");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String accessToken = loginJson.get("data").get("accessToken").asText();
        String currentRefreshToken = loginJson.get("data").get("refreshToken").asText();

        // 3. Sử dụng Access Token gọi API bảo vệ /api/v1/auth/me
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is("chutro.test@rentflow.vn")))
                .andExpect(jsonPath("$.data.fullName", is("Trần Văn Chủ Trọ")))
                .andExpect(jsonPath("$.data.role", is("LANDLORD")));

        // 4. Xoay vòng Refresh Token (Token Rotation)
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(currentRefreshToken);
        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()))
                .andReturn();

        JsonNode refreshJson = objectMapper.readTree(refreshResult.getResponse().getContentAsString());
        String newRefreshToken = refreshJson.get("data").get("refreshToken").asText();
        assertThat(newRefreshToken).isNotEqualTo(currentRefreshToken);

        // 5. Thử dùng lại refresh token cũ đã bị xoay vòng -> phải bị từ chối
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("INVALID_REFRESH_TOKEN")));

        // 6. Kiểm tra bảng Audit Logs có ghi nhận các sự kiện bảo mật
        Integer auditCount = jdbcTemplate.queryForObject("SELECT count(*) FROM audit_logs", Integer.class);
        assertThat(auditCount).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Thất bại với mật khẩu sai, không để lộ thông tin nhạy cảm")
    void login_wrongPassword_fails() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "tenant.test@rentflow.vn",
                "ValidPassword123!",
                "Lê Khách Thuê",
                "0911223344",
                UserRole.TENANT
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest wrongLogin = new LoginRequest("tenant.test@rentflow.vn", "WrongPassword!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLogin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("INVALID_CREDENTIALS")))
                .andExpect(jsonPath("$.message", is("Email hoặc mật khẩu không chính xác")));
    }
}
