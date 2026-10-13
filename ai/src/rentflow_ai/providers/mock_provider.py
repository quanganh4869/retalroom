from rentflow_ai.providers.base import BaseAIProvider
from rentflow_ai.schemas.maintenance import (
    MaintenanceCategory,
    MaintenanceClassifyRequest,
    MaintenanceClassifyResponse,
    SuggestedPriority,
)


class MockAIProvider(BaseAIProvider):
    """Deterministic, offline provider for development and testing."""

    async def classify_maintenance(
        self, request: MaintenanceClassifyRequest
    ) -> MaintenanceClassifyResponse:
        content = f"{request.title} {request.description}".lower()

        # Deterministic categorization logic
        if any(w in content for w in ["water", "leak", "pipe", "toilet", "sink", "drain"]):
            category = MaintenanceCategory.PLUMBING
        elif any(w in content for w in ["light", "power", "electric", "spark", "socket"]):
            category = MaintenanceCategory.ELECTRICAL
        elif any(
            w in content for w in ["air conditioner", "ac", "heater", "hvac", "heating", "cooling"]
        ):
            category = MaintenanceCategory.HVAC
        elif any(
            w in content
            for w in ["fridge", "refrigerator", "stove", "microwave", "washing machine"]
        ):
            category = MaintenanceCategory.APPLIANCE
        elif any(w in content for w in ["wall", "door", "window", "roof", "ceiling", "lock"]):
            category = MaintenanceCategory.STRUCTURAL
        else:
            category = MaintenanceCategory.GENERAL

        # Deterministic priority detection
        if any(
            w in content
            for w in ["flood", "fire", "spark", "explosion", "urgent", "danger", "burst"]
        ):
            priority = SuggestedPriority.EMERGENCY
            confidence = 0.95
            rationale = (
                "Urgent keywords detected indicate immediate safety risk "
                "or potential structural damage."
            )
        elif any(
            w in content for w in ["broken", "no water", "no electricity", "severe", "cannot lock"]
        ):
            priority = SuggestedPriority.HIGH
            confidence = 0.90
            rationale = "Critical amenity loss or basic security vulnerability detected."
        elif any(w in content for w in ["dripping", "slow", "noise", "flicker"]):
            priority = SuggestedPriority.MEDIUM
            confidence = 0.85
            rationale = "Inconvenience detected that requires inspection before worsening."
        else:
            priority = SuggestedPriority.LOW
            confidence = 0.80
            rationale = "Routine maintenance request categorized as standard priority."

        summary = f"[{category.value.upper()}] {request.title}"

        return MaintenanceClassifyResponse(
            category=category,
            suggested_priority=priority,
            summary=summary,
            confidence_score=confidence,
            is_ai_generated=True,
            rationale=rationale,
        )
