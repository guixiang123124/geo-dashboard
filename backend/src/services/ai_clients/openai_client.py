"""
OpenAI API client for ChatGPT integration.
"""

import time
import asyncio
from typing import Optional
from openai import AsyncOpenAI
from openai import OpenAIError

from .base import BaseAIClient, AIResponse


class OpenAIClient(BaseAIClient):
    """OpenAI ChatGPT client implementation."""

    def __init__(self, api_key: str, model_name: str = "gpt-4-turbo-preview", timeout: int = 30):
        """
        Initialize OpenAI client.

        Args:
            api_key: OpenAI API key
            model_name: Model to use (gpt-4-turbo-preview, gpt-3.5-turbo, etc.)
            timeout: Request timeout in seconds
        """
        super().__init__(api_key, model_name, timeout)
        self.client = AsyncOpenAI(api_key=api_key, timeout=timeout)

    async def chat(self, prompt: str, system_prompt: Optional[str] = None) -> AIResponse:
        """
        Send a chat prompt to ChatGPT.

        Args:
            prompt: User query
            system_prompt: Optional system instructions

        Returns:
            AIResponse with ChatGPT's response

        Raises:
            OpenAIError: If API call fails
        """
        start_time = time.time()

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=2000,
            )

            response_time_ms = int((time.time() - start_time) * 1000)

            return AIResponse(
                text=response.choices[0].message.content or "",
                model=self.model_name,
                response_time_ms=response_time_ms,
                raw_response=response.model_dump(),
            )

        except OpenAIError as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            return AIResponse(
                text="",
                model=self.model_name,
                response_time_ms=response_time_ms,
                error=str(e),
            )

    async def is_available(self) -> bool:
        """
        Check if OpenAI API is available.

        Returns:
            True if API responds, False otherwise
        """
        try:
            # Simple test call with minimal tokens
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": "test"}],
                max_tokens=5,
            )
            return response is not None
        except Exception:
            return False


class OpenAIClientWithRetry(OpenAIClient):
    """OpenAI client with automatic retry logic."""

    def __init__(
        self,
        api_key: str,
        model_name: str = "gpt-4-turbo-preview",
        timeout: int = 30,
        max_retries: int = 3,
        retry_delay: int = 2,
    ):
        """
        Initialize OpenAI client with retry logic.

        Args:
            api_key: OpenAI API key
            model_name: Model to use
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
            retry_delay: Delay between retries in seconds
        """
        super().__init__(api_key, model_name, timeout)
        self.max_retries = max_retries
        self.retry_delay = retry_delay

    async def chat(self, prompt: str, system_prompt: Optional[str] = None) -> AIResponse:
        """
        Send chat prompt with automatic retries on failure.

        Args:
            prompt: User query
            system_prompt: Optional system instructions

        Returns:
            AIResponse with ChatGPT's response
        """
        last_error = None

        for attempt in range(self.max_retries):
            try:
                response = await super().chat(prompt, system_prompt)

                # If no error, return immediately
                if not response.error:
                    return response

                # If error occurred, save it and retry
                last_error = response.error

            except Exception as e:
                last_error = str(e)

            # Wait before retrying (exponential backoff)
            if attempt < self.max_retries - 1:
                await asyncio.sleep(self.retry_delay * (2**attempt))

        # All retries failed, return error response
        return AIResponse(
            text="",
            model=self.model_name,
            response_time_ms=0,
            error=f"Failed after {self.max_retries} attempts. Last error: {last_error}",
        )
