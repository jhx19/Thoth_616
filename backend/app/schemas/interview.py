from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.common import UsageSchema

class InterviewCreate(BaseModel):
    topic: str

class InterviewTurnCreate(BaseModel):
    sme_response: str

class InterviewTurnRead(BaseModel):
    turn_number: int
    sme_response: str
    agent_follow_up: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}

class InterviewTurnResponse(BaseModel):
    turn_number: int
    sme_response: str
    agent_follow_up: Optional[str]
    timestamp: datetime
    usage: Optional[UsageSchema] = None

class InterviewSummary(BaseModel):
    interview_id: str
    topic: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

class InterviewRead(BaseModel):
    interview_id: str
    sme_id: str
    topic: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

class InterviewWithTurns(BaseModel):
    interview_id: str
    sme_id: str
    topic: str
    status: str
    turns: list[InterviewTurnRead]

    model_config = {"from_attributes": True}

class InterviewListResponse(BaseModel):
    interviews: list[InterviewSummary]
