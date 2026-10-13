import logging
import sys

from rentflow_ai.core.config import settings


def setup_logging() -> None:
    log_format = "%(asctime)s [%(levelname)s] [rentflow-ai] %(name)s: %(message)s"
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
        format=log_format,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
