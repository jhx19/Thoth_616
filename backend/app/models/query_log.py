from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey, func
from app.db import Base


class UserQueryLog(Base):
    __tablename__ = "user_query_log"

    id = Column(String, primary_key=True)
    question = Column(Text, nullable=False)
    session_id = Column(String, nullable=True)
    response_type = Column(String, nullable=True)
    related_sme_id = Column(String, ForeignKey("smes.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
