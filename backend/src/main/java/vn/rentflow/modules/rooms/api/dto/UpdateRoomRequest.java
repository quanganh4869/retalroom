package vn.rentflow.modules.rooms.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import vn.rentflow.modules.rooms.domain.RoomStatus;

import java.math.BigDecimal;

@Schema(description = "Yêu cầu cập nhật thông tin phòng trọ")
public class UpdateRoomRequest {

    @Size(max = 50, message = "Số phòng không được vượt quá 50 ký tự")
    @Schema(description = "Số phòng hoặc mã phòng", example = "P.201")
    private String roomNumber;

    @Min(value = 0, message = "Tầng phải từ 0 trở lên")
    @Schema(description = "Tầng của phòng", example = "2")
    private Integer floor;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá thuê không được âm")
    @Schema(description = "Giá thuê cơ bản theo tháng (VNĐ)", example = "3800000.00")
    private BigDecimal basePrice;

    @DecimalMin(value = "1.0", inclusive = true, message = "Diện tích phòng tối thiểu là 1 m2")
    @Schema(description = "Diện tích sử dụng (m2)", example = "26.0")
    private BigDecimal areaSqm;

    @Schema(description = "Trạng thái phòng", example = "AVAILABLE")
    private RoomStatus status;

    public UpdateRoomRequest() {
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

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }
}
