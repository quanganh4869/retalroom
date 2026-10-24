package vn.rentflow.modules.onboarding.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "Yêu cầu tạo phòng đầu tiên cho Chủ nhà trong Onboarding")
public class LandlordFirstRoomRequest {

    @NotNull(message = "Property ID không được để trống")
    @Schema(description = "Mã ID bất động sản chứa phòng này")
    private UUID propertyId;

    @NotBlank(message = "Số phòng/Tên phòng không được để trống")
    @Schema(description = "Số phòng hoặc tên định danh", example = "P101")
    private String roomNumber;

    @NotNull(message = "Tầng không được để trống")
    @Min(value = 1, message = "Số tầng tối thiểu là 1")
    @Schema(description = "Tầng của phòng", example = "1")
    private Integer floor = 1;

    @NotNull(message = "Giá thuê cơ bản không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá thuê không được âm")
    @Schema(description = "Giá thuê theo tháng (VND)", example = "3500000.00")
    private BigDecimal basePrice;

    @DecimalMin(value = "1.0", message = "Diện tích phòng tối thiểu 1 m²")
    @Schema(description = "Diện tích phòng tính theo m²", example = "25.0")
    private BigDecimal areaSqm = BigDecimal.valueOf(25.0);

    public LandlordFirstRoomRequest() {
    }

    public LandlordFirstRoomRequest(UUID propertyId, String roomNumber, Integer floor, BigDecimal basePrice, BigDecimal areaSqm) {
        this.propertyId = propertyId;
        this.roomNumber = roomNumber;
        this.floor = floor != null ? floor : 1;
        this.basePrice = basePrice;
        this.areaSqm = areaSqm != null ? areaSqm : BigDecimal.valueOf(25.0);
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
