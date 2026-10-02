from datetime import date as DateType
from typing import Dict, List, Literal

from pydantic import BaseModel, Field


class AssistantMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=3000)


class AssistantChatRequest(BaseModel):
    messages: List[AssistantMessage]
    today: DateType


class AssistantConfirmRequest(BaseModel):
    confirmed: bool
    kind: Literal["expense", "revenue"]
    date: DateType
    values: Dict[str, float]
    replace_existing: bool = False