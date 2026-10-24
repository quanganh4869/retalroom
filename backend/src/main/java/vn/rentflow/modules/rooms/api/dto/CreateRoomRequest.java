package vn.rentflow.modules.rooms.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "Yêu cầu tạo phòng trọ mới")
public class CreateRoomRequest {

    @NotNull(message = "Mã bất động sản (propertyId) không được để trống")
    @Schema(description = "ID khu trọ / toà nhà", example = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
    private UUID propertyId;

    @NotBlank(message = "Số phòng / mã phòng không được để trống")
    @Size(max = 50, message = "Số phòng không được vượt quá 50 ký tự")
    @Schema(description = "Số phòng hoặc mã phòng", example = "P.201")
    private String roomNumber;

    @NotNull(message = "Tầng không được để trống")
    @Min(value = 0, message = "Tầng phải từ 0 trở lên")
    @Schema(description = "Tầng của phòng", example = "2")
    private Integer floor;

    @NotNull(message = "Giá thuê cơ bản không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá thuê không được âm")
    @Schema(description = "Giá thuê cơ bản theo tháng (VNĐ)", example = "3500000.00")
    private BigDecimal basePrice;

    @DecimalMin(value = "1.0", inclusive = true, message = "Diện tích phòng tối thiểu là 1 m2")
    @Schema(description = "Diện tích sử dụng (m2)", example = "25.5")
    private BigDecimal areaSqm;

    public CreateRoomRequest() {
    }

    public CreateRoomRequest(UUID propertyId, String roomNumber, Integer floor, BigDecimal basePrice, BigDecimal areaSqm) {
        this.propertyId = propertyId;
        this.roomNumber = roomNumber;
        this.floor = floor;
        this.basePrice = basePrice;
        this.areaSqm = areaSqm;
    }

    public UUID getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(UUID propertyId) {
        this.propertyId = propertyId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public BigDecimal getAreaSqm() {
        return areaSqm;
    }

    public void setAreaSqm(BigDecimal areaSqm) {
        this.areaSqm = areaSqm;
    }
}
