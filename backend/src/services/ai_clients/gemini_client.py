"""
Google Gemini AI client implementation.
"""

import asyncio
import time
from typing import Optional

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from .base import BaseAIClient, AIResponse


class GeminiClient(BaseAIClient):
    """Client for Google Gemini API."""

    def __init__(self, api_key: str, model_name: str = "gemini-pro", timeout: int = 30):
        if genai is None:
            raise ImportError(
                "google-generativeai package not installed. "
                "Install with: pip install google-generativeai"
            )

        self.api_key = api_key
        self.model_name = model_name
        self.timeout = timeout

        # Configure Gemini
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)

    async def is_available(self) -> bool:
        """Check if Gemini API is available."""
        try:
            # Simple test to check if API key is valid
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, self.model.generate_content, "Hello"
            )
            return True
        except Exception:
            return False

    async def chat(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> AIResponse:
        """
        Send a chat request to Gemini API.

        Args:
            prompt: The user prompt
            system_prompt: Optional system instruction (Gemini supports this)

        Returns:
            AIResponse with the model's response
        """
        start_time = time.time()

        try:
            # Combine system prompt with user prompt if provided
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"

            # Gemini API is synchronous, so we run it in an executor
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, self.model.generate_content, full_prompt
            )

            response_time_ms = int((time.time() - start_time) * 1000)

            # Extract text from response
            response_text = response.text if hasattr(response, "text") else ""

            return AIResponse(
                text=response_text,
                model=self.model_name,
                response_time_ms=response_time_ms,
                raw_response={
                    "prompt_feedback": (
                        response.prompt_feedback._raw_part
                        if hasattr(response, "prompt_feedback")
                        else None
                    ),
                    "candidates": (
                        [c._raw_part for c in response.candidates]
                        if hasattr(response, "candidates")
                        else []
                    ),
                },
            )

        except Exception as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            error_message = str(e)

            return AIResponse(
                text="",
                model=self.model_name,
                response_time_ms=response_time_ms,
                error=error_message,
            )


class GeminiClientWithRetry(GeminiClient):
    """Gemini client with automatic retry logic."""

    def __init__(
        self,
        api_key: str,
        model_name: str = "gemini-pro",
        timeout: int = 30,
        max_retries: int = 3,
        retry_delay: int = 2,
    ):
        super().__init__(api_key, model_name, timeout)
        self.max_retries = max_retries
        self.retry_delay = retry_delay

    async def chat(
        self, prompt: str, system_prompt: Optional[str] = None
    ) -> AIResponse:
        """
        Send a chat request with automatic retry on failure.

        Implements exponential backoff: 2s, 4s, 8s, etc.
        """
        last_error = None

        for attempt in range(self.max_retries):
            try:
                response = await super().chat(prompt, system_prompt)

                # If no error, return immediately
                if not response.error:
                    return response

                # If there's an error, store it and retry
                last_error = response.error

            except Exception as e:
                last_error = str(e)

            # If not the last attempt, wait before retrying
            if attempt < self.max_retries - 1:
                wait_time = self.retry_delay * (2**attempt)  # Exponential backoff
                await asyncio.sleep(wait_time)

        # All retries failed
        return AIResponse(
            text="",
            model=self.model_name,
            response_time_ms=0,
            error=f"Failed after {self.max_retries} attempts. Last error: {last_error}",
        )
