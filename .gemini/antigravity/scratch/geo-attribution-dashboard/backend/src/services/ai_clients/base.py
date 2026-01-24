"""
Base abstract class for AI model clients.
"""

from abc import ABC, abstractmethod
from typing import Optional
from dataclasses import dataclass


@dataclass
class AIResponse:
    """Standard AI response format."""

    text: str
    model: str
    response_time_ms: int
    raw_response: Optional[dict] = None
    error: Optional[str] = None


class BaseAIClient(ABC):
    """Abstract base class for AI model clients."""

    def __init__(self, api_key: str, model_name: str, timeout: int = 30):
        """
        Initialize AI client.

        Args:
            api_key: API key for the AI service
            model_name: Model identifier to use
            timeout: Request timeout in seconds
        """
        self.api_key = api_key
        self.model_name = model_name
        self.timeout = timeout

    @abstractmethod
    async def chat(self, prompt: str, system_prompt: Optional[str] = None) -> AIResponse:
        """
        Send a chat prompt to the AI model.

        Args:
            prompt: User prompt/query
            system_prompt: Optional system instructions

        Returns:
            AIResponse with text and metadata

        Raises:
            Exception: If API call fails
        """
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """
        Check if the AI service is available.

        Returns:
            True if service can be reached, False otherwise
        """
        pass
