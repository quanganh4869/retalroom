from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PropertyBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    address: str = Field(..., min_length=3, max_length=300)
    city: str = Field(..., min_length=2, max_length=100)
    total_floors: int = Field(default=1, ge=1, le=150)
    description: str | None = Field(default=None, max_length=2000)


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    address: str | None = Field(default=None, min_length=3, max_length=300)
    city: str | None = Field(default=None, min_length=2, max_length=100)
    total_floors: int | None = Field(default=None, ge=1, le=150)
    description: str | None = Field(default=None, max_length=2000)


class PropertyResponse(PropertyBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


class PropertyListResponse(BaseModel):
    items: list[PropertyResponse]
    total: int
    page: int
    page_size: int
