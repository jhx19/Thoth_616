from sqlalchemy import Column, String, Text, Boolean, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import JSONB
from app.db import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True)
    last_question = Column(Text, nullable=True)
    pending_clarification = Column(Boolean, default=False)
    pending_context = Column(JSONB, nullable=True)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
