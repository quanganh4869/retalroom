package vn.rentflow.modules.rooms;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import vn.rentflow.modules.rooms.api.dto.CreateRoomRequest;
import vn.rentflow.modules.rooms.domain.RoomStatus;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoomControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private UUID userId;
    private UUID propertyId;

    @BeforeEach
    void setUpDatabase() {
        userId = UUID.randomUUID();
        propertyId = UUID.randomUUID();

        // Clean tables
        jdbcTemplate.execute("DELETE FROM tenancies");
        jdbcTemplate.execute("DELETE FROM invitations");
        jdbcTemplate.execute("DELETE FROM audit_logs");
        jdbcTemplate.execute("DELETE FROM refresh_tokens");
        jdbcTemplate.execute("DELETE FROM rooms");
        jdbcTemplate.execute("DELETE FROM properties");
        jdbcTemplate.execute("DELETE FROM users");

        // Seed user (landlord) and property so foreign keys are satisfied
        jdbcTemplate.update(
                "INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
                userId, "landlord@rentflow.vn", "$2a$10$xyz", "Nguyễn Văn Chủ Trọ", "LANDLORD"
        );

        jdbcTemplate.update(
                "INSERT INTO properties (id, landlord_id, name, address, city, total_floors) VALUES (?, ?, ?, ?, ?, ?)",
                propertyId, userId, "Nhà trọ Hoa Hồng", "123 Đường số 5", "Hồ Chí Minh", 3
        );
    }

    @Test
    @WithMockUser(username = "landlord@rentflow.vn", roles = {"LANDLORD"})
    @DisplayName("POST /api/v1/rooms - Tạo phòng thành công khi có quyền LANDLORD")
    void createRoom_success() throws Exception {
        CreateRoomRequest request = new CreateRoomRequest(
                propertyId, "P.301", 3, BigDecimal.valueOf(3200000.00), BigDecimal.valueOf(22.5)
        );

        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.roomNumber", is("P.301")))
                .andExpect(jsonPath("$.data.floor", is(3)))
                .andExpect(jsonPath("$.data.status", is(RoomStatus.AVAILABLE.name())))
                .andExpect(jsonPath("$.data.id", notNullValue()));
    }

    @Test
    @WithMockUser(username = "landlord@rentflow.vn", roles = {"LANDLORD"})
    @DisplayName("POST /api/v1/rooms - Lỗi 400 validation kèm mã traceId X-Request-Id")
    void createRoom_validationError() throws Exception {
        CreateRoomRequest invalidRequest = new CreateRoomRequest(
                null, "", -1, BigDecimal.valueOf(-500), BigDecimal.valueOf(0)
        );

        mockMvc.perform(post("/api/v1/rooms")
                        .header("X-Request-Id", "test-trace-12345")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("X-Request-Id", "test-trace-12345"))
                .andExpect(jsonPath("$.code", is("VALIDATION_ERROR")))
                .andExpect(jsonPath("$.requestId", is("test-trace-12345")))
                .andExpect(jsonPath("$.validationErrors.roomNumber", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/rooms - Trả về 401 Unauthorized khi chưa đăng nhập")
    void createRoom_unauthorized() throws Exception {
        CreateRoomRequest request = new CreateRoomRequest(
                propertyId, "P.301", 3, BigDecimal.valueOf(3200000.00), BigDecimal.valueOf(22.5)
        );

        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("UNAUTHORIZED")));
    }

    @Test
    @WithMockUser(username = "tenant@rentflow.vn", roles = {"TENANT"})
    @DisplayName("POST /api/v1/rooms - Trả về 403 Forbidden khi TENANT cố tình tạo phòng")
    void createRoom_forbiddenForTenant() throws Exception {
        CreateRoomRequest request = new CreateRoomRequest(
                propertyId, "P.301", 3, BigDecimal.valueOf(3200000.00), BigDecimal.valueOf(22.5)
        );

        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("ACCESS_DENIED")));
    }

    @Test
    @DisplayName("GET /api/v1/health/live & /ready - Trả về 200 OK công khai")
    void healthChecks_success() throws Exception {
        mockMvc.perform(get("/api/v1/health/live"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("UP")));

        mockMvc.perform(get("/api/v1/health/ready"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.database", is("UP")));
    }
}
