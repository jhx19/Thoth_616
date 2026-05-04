from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.query_log import UserQueryLog
from app.models.sme import SME
from app.repositories.utils import new_id


class QueryLogRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log(
        self,
        question: str,
        session_id: str | None = None,
        response_type: str | None = None,
        related_sme_id: str | None = None,
    ) -> None:
        """D calls this on every /query to record the question."""
        entry = UserQueryLog(
            id=new_id("qlog"),
            question=question,
            session_id=session_id,
            response_type=response_type,
            related_sme_id=related_sme_id,
        )
        self.db.add(entry)
        await self.db.commit()

    async def get_questions_by_specialization(
        self,
        specialization: str,
        limit: int = 20,
    ) -> list[str]:
        """C calls this to get historical user questions related to an SME's specialization."""
        result = await self.db.execute(
            select(UserQueryLog.question)
            .join(SME, UserQueryLog.related_sme_id == SME.id, isouter=True)
            .where(SME.specialization.ilike(f"%{specialization}%"))
            .order_by(UserQueryLog.created_at.desc())
            .limit(limit)
        )
        return [row[0] for row in result.fetchall()]
