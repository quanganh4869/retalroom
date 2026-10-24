package vn.rentflow.modules.rooms.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rooms", uniqueConstraints = {
        @UniqueConstraint(name = "uk_rooms_property_number", columnNames = {"property_id", "room_number"})
})
public class Room {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "property_id", nullable = false)
    private UUID propertyId;

    @Column(name = "room_number", nullable = false, length = 50)
    private String roomNumber;

    @Column(name = "floor", nullable = false)
    private Integer floor;

    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "area_sqm", nullable = false, precision = 6, scale = 2)
    private BigDecimal areaSqm;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private RoomStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Room() {
        // Required by JPA
    }

    public Room(UUID id, UUID propertyId, String roomNumber, Integer floor, BigDecimal basePrice, BigDecimal areaSqm) {
        this.id = id != null ? id : UUID.randomUUID();
        this.propertyId = propertyId;
        this.roomNumber = roomNumber;
        this.floor = floor != null ? floor : 1;
        this.basePrice = basePrice != null ? basePrice : BigDecimal.ZERO;
        this.areaSqm = areaSqm != null ? areaSqm : BigDecimal.valueOf(20.0);
        this.status = RoomStatus.AVAILABLE;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void updateDetails(String roomNumber, Integer floor, BigDecimal basePrice, BigDecimal areaSqm, RoomStatus status) {
        if (roomNumber != null && !roomNumber.isBlank()) {
            this.roomNumber = roomNumber.trim();
        }
        if (floor != null) {
            this.floor = floor;
        }
        if (basePrice != null) {
            this.basePrice = basePrice;
        }
        if (areaSqm != null) {
            this.areaSqm = areaSqm;
        }
        if (status != null) {
            this.status = status;
        }
        this.updatedAt = Instant.now();
    }

    public void occupy() {
        this.status = RoomStatus.OCCUPIED;
        this.updatedAt = Instant.now();
    }

    public void release() {
        this.status = RoomStatus.AVAILABLE;
        this.updatedAt = Instant.now();
    }

    public void setUnderMaintenance() {
        this.status = RoomStatus.MAINTENANCE;
        this.updatedAt = Instant.now();
    }

    // Getters
    public UUID getId() {
        return id;
    }

    public UUID getPropertyId() {
        return propertyId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public Integer getFloor() {
        return floor;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public BigDecimal getAreaSqm() {
        return areaSqm;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
