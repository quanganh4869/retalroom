package vn.rentflow.modules.rooms.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import vn.rentflow.modules.rooms.domain.Room;
import vn.rentflow.modules.rooms.domain.RoomStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết phòng trọ")
public class RoomResponse {

    private UUID id;
    private UUID propertyId;
    private String roomNumber;
    private Integer floor;
    private BigDecimal basePrice;
    private BigDecimal areaSqm;
    private RoomStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public RoomResponse() {
    }

    public static RoomResponse from(Room room) {
        RoomResponse resp = new RoomResponse();
        resp.id = room.getId();
        resp.propertyId = room.getPropertyId();
        resp.roomNumber = room.getRoomNumber();
        resp.floor = room.getFloor();
        resp.basePrice = room.getBasePrice();
        resp.areaSqm = room.getAreaSqm();
        resp.status = room.getStatus();
        resp.createdAt = room.getCreatedAt();
        resp.updatedAt = room.getUpdatedAt();
        return resp;
    }

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
