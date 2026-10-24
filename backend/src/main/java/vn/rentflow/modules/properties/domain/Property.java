package vn.rentflow.modules.properties.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "properties", indexes = {
        @Index(name = "ix_properties_landlord_id", columnList = "landlord_id"),
        @Index(name = "ix_properties_name", columnList = "name")
})
public class Property {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "landlord_id", nullable = false)
    private UUID landlordId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "address", nullable = false, length = 300)
    private String address;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "total_floors", nullable = false)
    private Integer totalFloors;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "billing_day", nullable = false)
    private Integer billingDay = 1;

    @Column(name = "payment_cycle", nullable = false, length = 50)
    private String paymentCycle = "MONTHLY";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Property() {
    }

    public Property(UUID id, UUID landlordId, String name, String address, String city, Integer totalFloors, String description) {
        this.id = id != null ? id : UUID.randomUUID();
        this.landlordId = landlordId;
        this.name = name != null ? name.trim() : "";
        this.address = address != null ? address.trim() : "";
        this.city = city != null ? city.trim() : "";
        this.totalFloors = totalFloors != null ? totalFloors : 1;
        this.description = description;
        this.billingDay = 1;
        this.paymentCycle = "MONTHLY";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void updateManagementConfig(Integer billingDay, String paymentCycle) {
        if (billingDay != null && billingDay >= 1 && billingDay <= 31) {
            this.billingDay = billingDay;
        }
        if (paymentCycle != null && !paymentCycle.isBlank()) {
            this.paymentCycle = paymentCycle.trim();
        }
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getLandlordId() {
        return landlordId;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public Integer getTotalFloors() {
        return totalFloors;
    }

    public String getDescription() {
        return description;
    }

    public Integer getBillingDay() {
        return billingDay;
    }

    public String getPaymentCycle() {
        return paymentCycle;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
