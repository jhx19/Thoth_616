from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.middleware.auth import verify_token
from app.repositories.interview_repository import InterviewRepository
from app.schemas.interview import (
    InterviewCreate, InterviewRead, InterviewListResponse,
    InterviewWithTurns
)

router = APIRouter(prefix="/api/v1", dependencies=[Depends(verify_token)])


@router.post("/smes/{sme_id}/interviews", response_model=InterviewRead, status_code=201)
async def create_interview(
    sme_id: str,
    body: InterviewCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new interview record. No LLM call - pure data operation."""
    repo = InterviewRepository(db)
    # Verify SME exists
    from app.repositories.sme_repository import SMERepository
    sme_repo = SMERepository(db)
    sme = await sme_repo.get(sme_id)
    if not sme:
        raise HTTPException(status_code=404, detail="SME not found")
    return await repo.create(sme_id=sme_id, topic=body.topic)


@router.get("/smes/{sme_id}/interviews", response_model=InterviewListResponse)
async def list_interviews(
    sme_id: str,
    db: AsyncSession = Depends(get_db),
):
    """List all interviews for an SME (no turns)."""
    repo = InterviewRepository(db)
    interviews = await repo.list_by_sme(sme_id)
    return InterviewListResponse(interviews=interviews)


@router.get("/interviews/{interview_id}", response_model=InterviewWithTurns)
async def get_interview(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get full interview with all turns."""
    repo = InterviewRepository(db)
    result = await repo.get_with_turns(interview_id)
    if not result:
        raise HTTPException(status_code=404, detail="Interview not found")
    return result
