from typing import Any

from fastapi import HTTPException, status


class RentFlowException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        code: str = "ERROR",
        extra: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(status_code=status_code, detail=detail)
        self.code = code
        self.extra = extra or {}


class NotFoundException(RentFlowException):
    def __init__(self, resource: str, identifier: Any) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with identifier '{identifier}' was not found.",
            code="NOT_FOUND",
        )


class ConflictException(RentFlowException):
    def __init__(self, detail: str) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            code="CONFLICT",
        )


class ExternalServiceException(RentFlowException):
    def __init__(self, service_name: str, detail: str) -> None:
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"External service '{service_name}' error: {detail}",
            code="BAD_GATEWAY",
        )
