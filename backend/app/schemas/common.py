from pydantic import BaseModel
from typing import Optional

class UsageSchema(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    model: str

class ErrorResponse(BaseModel):
    error: str
    code: Optional[str] = None
