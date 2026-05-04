from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime, timezone
from app.models.session import Session
from app.repositories.utils import new_id


class SessionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create(self, session_id: str) -> Session:
        result = await self.db.execute(
            select(Session).where(Session.id == session_id)
        )
        session = result.scalar_one_or_none()
        if not session:
            session = Session(
                id=session_id,
                pending_clarification=False,
            )
            self.db.add(session)
            await self.db.commit()
            await self.db.refresh(session)
        return session

    async def set_pending(
        self,
        session_id: str,
        last_question: str,
        pending_context: dict,
    ) -> None:
        session = await self.get_or_create(session_id)
        session.last_question = last_question
        session.pending_clarification = True
        session.pending_context = pending_context
        session.updated_at = datetime.now(timezone.utc)
        await self.db.commit()

    async def clear_pending(self, session_id: str) -> None:
        session = await self.get_or_create(session_id)
        session.pending_clarification = False
        session.pending_context = None
        session.updated_at = datetime.now(timezone.utc)
        await self.db.commit()

    async def clear_all(self) -> None:
        await self.db.execute(delete(Session))
        await self.db.commit()