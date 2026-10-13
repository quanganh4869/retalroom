from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class MaintenanceCategory(StrEnum):
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    HVAC = "hvac"
    APPLIANCE = "appliance"
    STRUCTURAL = "structural"
    GENERAL = "general"


class SuggestedPriority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EMERGENCY = "emergency"


class MaintenanceClassifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Short summary of the issue",
    )
    description: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Detailed problem description",
    )
    room_number: str | None = Field(
        default=None,
        max_length=50,
        description="Optional room or unit identifier",
    )


class MaintenanceClassifyResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: MaintenanceCategory
    suggested_priority: SuggestedPriority
    summary: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    is_ai_generated: bool = Field(
        default=True,
        description="Indicates recommendation requires human review",
    )
    rationale: str
