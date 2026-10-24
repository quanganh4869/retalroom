package vn.rentflow.modules.onboarding.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Yêu cầu khởi tạo tòa nhà/khu trọ đầu tiên cho Chủ nhà trong Onboarding")
public class LandlordPropertySetupRequest {

    @NotBlank(message = "Tên khu trọ/tòa nhà không được để trống")
    @Schema(description = "Tên bất động sản/nhà trọ", example = "Nhà trọ Hoa Sen")
    private String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Schema(description = "Địa chỉ chi tiết", example = "Số 123 Đường Cầu Giấy, Phường Dịch Vọng")
    private String address;

    @Schema(description = "Tỉnh/Thành phố", example = "Hà Nội")
    private String city = "Hà Nội";

    @Min(value = 1, message = "Số tầng tối thiểu là 1")
    @Max(value = 50, message = "Số tầng tối đa là 50")
    @Schema(description = "Tổng số tầng", example = "4")
    private Integer totalFloors = 1;

    @Schema(description = "Mô tả thêm về tòa nhà", example = "Khu trọ an ninh, có khóa vân tay, thang máy")
    private String description;

    public LandlordPropertySetupRequest() {
    }

    public LandlordPropertySetupRequest(String name, String address, String city, Integer totalFloors, String description) {
        this.name = name;
        this.address = address;
        this.city = city != null ? city : "Hà Nội";
        this.totalFloors = totalFloors != null ? totalFloors : 1;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Integer getTotalFloors() {
        return totalFloors;
    }

    public void setTotalFloors(Integer totalFloors) {
        this.totalFloors = totalFloors;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
