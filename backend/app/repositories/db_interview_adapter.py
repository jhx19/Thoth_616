"""
Wraps InterviewRepository with its own AsyncSessionLocal session
so it can be used as a module-level singleton in dependencies.py.

Returns dicts in the format C's InterviewService expects (not Pydantic schemas),
because the service was written against an in-memory stub that returned plain dicts.
"""
from app.repositories.interview_repository import InterviewRepository


class DBInterviewRepository:
    """Drop-in replacement for the in-memory stub. Persists to Postgres."""

    async def create(self, sme_id=None, topic=None, requested_by=None, admin_note=None, **kwargs):
        from app.db import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            result = await InterviewRepository(db).create(
                sme_id=sme_id,
                topic=topic,
                requested_by=requested_by,
                admin_note=admin_note,
            )
            # C's services expect {"id": ..., "sme_id": ..., "topic": ..., ...}
            return {
                "id": result.interview_id,
                "sme_id": result.sme_id,
                "topic": result.topic,
                "status": result.status,
                "requested_by": requested_by,
                "admin_note": admin_note,
            }

    async def get(self, interview_id, **kwargs):
        from app.db import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            result = await InterviewRepository(db).get(interview_id)
            if result is None:
                return None
            return {
                "id": result.interview_id,
                "sme_id": result.sme_id,
                "topic": result.topic,
                "status": result.status,
            }

    async def get_with_turns(self, interview_id, **kwargs):
        from app.db import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            result = await InterviewRepository(db).get_with_turns(interview_id)
            if result is None:
                return None
            # C's _reconstruct_state expects {"interview": {"topic": ..., "status": ...}, "turns": [...]}
            return {
                "interview": {
                    "id": result.interview_id,
                    "sme_id": result.sme_id,
                    "topic": result.topic,
                    "status": result.status,
                },
                "turns": [
                    {
                        "turn_number": t.turn_number,
                        "sme_response": t.sme_response,
                        "agent_follow_up": t.agent_follow_up,
                    }
                    for t in result.turns
                ],
            }

    async def list_by_sme(self, sme_id, **kwargs):
        from app.db import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            return await InterviewRepository(db).list_by_sme(sme_id)

    async def add_turn(self, *args, **kwargs):
        from app.db import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            return await InterviewRepository(db).add_turn(*args, **kwargs)

    async def mark_completed(self, *args, **kwargs):
        from app.db import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            return await InterviewRepository(db).mark_completed(*args, **kwargs)

    async def save_topic_summary(self, *args, **kwargs):
        from app.db import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            return await InterviewRepository(db).save_topic_summary(*args, **kwargs)

    async def get_all_topic_summaries(self, *args, **kwargs):
        from app.db import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            return await InterviewRepository(db).get_all_topic_summaries(*args, **kwargs)
