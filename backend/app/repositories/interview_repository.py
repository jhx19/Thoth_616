from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.interview import Interview, InterviewTurn
from app.schemas.interview import (
    InterviewRead, InterviewSummary, InterviewWithTurns, InterviewTurnRead
)
from app.repositories.utils import new_id


class InterviewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, sme_id: str, topic: str) -> InterviewRead:
        interview = Interview(
            id=new_id("int"),
            sme_id=sme_id,
            topic=topic,
            status="in_progress",
        )
        self.db.add(interview)
        await self.db.commit()
        await self.db.refresh(interview)
        return self._to_schema(interview)

    async def get(self, interview_id: str) -> InterviewRead | None:
        result = await self.db.execute(
            select(Interview).where(Interview.id == interview_id)
        )
        interview = result.scalar_one_or_none()
        return self._to_schema(interview) if interview else None

    async def list_by_sme(self, sme_id: str) -> list[InterviewSummary]:
        result = await self.db.execute(
            select(Interview)
            .where(Interview.sme_id == sme_id)
            .order_by(Interview.created_at.desc())
        )
        return [
            InterviewSummary(
                interview_id=i.id,
                topic=i.topic,
                status=i.status,
                created_at=i.created_at,
            )
            for i in result.scalars().all()
        ]

    async def get_with_turns(self, interview_id: str) -> InterviewWithTurns | None:
        result = await self.db.execute(
            select(Interview).where(Interview.id == interview_id)
        )
        interview = result.scalar_one_or_none()
        if not interview:
            return None

        turns_result = await self.db.execute(
            select(InterviewTurn)
            .where(InterviewTurn.interview_id == interview_id)
            .order_by(InterviewTurn.turn_number.asc())
        )
        turns = [
            InterviewTurnRead(
                turn_number=t.turn_number,
                sme_response=t.sme_response,
                agent_follow_up=t.agent_follow_up,
                timestamp=t.created_at,
            )
            for t in turns_result.scalars().all()
        ]
        return InterviewWithTurns(
            interview_id=interview.id,
            sme_id=interview.sme_id,
            topic=interview.topic,
            status=interview.status,
            turns=turns,
        )

    async def add_turn(
        self,
        interview_id: str,
        sme_response: str,
        agent_follow_up: str | None,
    ):
        result = await self.db.execute(
            select(func.max(InterviewTurn.turn_number)).where(
                InterviewTurn.interview_id == interview_id
            )
        )
        max_turn = result.scalar() or 0
        turn = InterviewTurn(
            id=new_id("turn"),
            interview_id=interview_id,
            turn_number=max_turn + 1,
            sme_response=sme_response,
            agent_follow_up=agent_follow_up,
        )
        self.db.add(turn)
        await self.db.commit()
        await self.db.refresh(turn)
        return turn

    async def mark_completed(self, interview_id: str) -> None:
        result = await self.db.execute(
            select(Interview).where(Interview.id == interview_id)
        )
        interview = result.scalar_one_or_none()
        if interview:
            interview.status = "completed"
            await self.db.commit()

    def _to_schema(self, interview: Interview) -> InterviewRead:
        return InterviewRead(
            interview_id=interview.id,
            sme_id=interview.sme_id,
            topic=interview.topic,
            status=interview.status,
            created_at=interview.created_at,
        )