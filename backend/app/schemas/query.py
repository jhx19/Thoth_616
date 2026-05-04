from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.common import UsageSchema

class QueryRequest(BaseModel):
    question: str
    session_id: str

class SourceReference(BaseModel):
    entry_id: str
    sme_name: str
    topic: str

class RoutingTarget(BaseModel):
    type: str  # "sme" or "admin"
    sme_name: Optional[str]
    specialization: str
    reason: str

class QueryResponse(BaseModel):
    answer: str
    grounded: bool
    sources: list[SourceReference]
    disclaimer: Optional[str]
    session_id: str
    response_type: str  # "answer", "clarification", "routing"
    routed_to: Optional[list[RoutingTarget]]
    timestamp: datetime
    usage: Optional[UsageSchema] = None
