from sqlalchemy import Column, String, Text, Date, Integer, TIMESTAMP, ForeignKey, func, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.db import Base

class KnowledgeEntry(Base):
    __tablename__ = "knowledge_entries"

    id = Column(String, primary_key=True)
    sme_id = Column(String, ForeignKey("smes.id", ondelete="CASCADE"), nullable=False)
    topic = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String, CheckConstraint("status IN ('draft', 'sme_approved', 'approved', 'rejected')"), nullable=False)
    sources_json = Column(JSONB, nullable=False, server_default='{"interviews":[],"materials":[]}')
    review_date = Column(Date, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    approved_at = Column(TIMESTAMP(timezone=True), nullable=True)
    admin_approved_at = Column(TIMESTAMP(timezone=True), nullable=True)
    rejected_at = Column(TIMESTAMP(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    sme = relationship("SME", back_populates="knowledge_entries")
    chunks = relationship("KnowledgeChunk", back_populates="entry", cascade="all, delete")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String, primary_key=True)
    entry_id = Column(String, ForeignKey("knowledge_entries.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(1024), nullable=True)

    __table_args__ = (UniqueConstraint("entry_id", "chunk_index"),)

    entry = relationship("KnowledgeEntry", back_populates="chunks")
