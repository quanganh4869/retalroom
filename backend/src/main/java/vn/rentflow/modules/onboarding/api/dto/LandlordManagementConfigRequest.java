package vn.rentflow.modules.onboarding.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(description = "Yêu cầu cấu hình vận hành và chu kỳ thanh toán")
public class LandlordManagementConfigRequest {

    @NotNull(message = "Property ID không được để trống")
    @Schema(description = "Mã ID của bất động sản đang cấu hình")
    private UUID propertyId;

    @NotNull(message = "Ngày chốt tiền/hóa đơn không được để trống")
    @Min(value = 1, message = "Ngày chốt tiền từ ngày 1 đến ngày 31 hàng tháng")
    @Max(value = 31, message = "Ngày chốt tiền từ ngày 1 đến ngày 31 hàng tháng")
    @Schema(description = "Ngày tạo hoá đơn định kỳ hàng tháng (1-31)", example = "5")
    private Integer billingDay = 1;

    @NotBlank(message = "Chu kỳ thanh toán không được để trống")
    @Schema(description = "Chu kỳ thanh toán: MONTHLY, QUARTERLY, YEARLY", example = "MONTHLY")
    private String paymentCycle = "MONTHLY";

    public LandlordManagementConfigRequest() {
    }

    public LandlordManagementConfigRequest(UUID propertyId, Integer billingDay, String paymentCycle) {
        this.propertyId = propertyId;
        this.billingDay = billingDay;
        this.paymentCycle = paymentCycle;
    }

    public UUID getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(UUID propertyId) {
        this.propertyId = propertyId;
    }

    public Integer getBillingDay() {
        return billingDay;
    }

    public void setBillingDay(Integer billingDay) {
        this.billingDay = billingDay;
    }

    public String getPaymentCycle() {
        return paymentCycle;
    }

    public void setPaymentCycle(String paymentCycle) {
        this.paymentCycle = paymentCycle;
    }
}
