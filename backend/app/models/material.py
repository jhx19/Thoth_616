from sqlalchemy import Column, String, Text, Boolean, Integer, TIMESTAMP, ForeignKey, func, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.db import Base

class Material(Base):
    __tablename__ = "materials"

    id = Column(String, primary_key=True)
    sme_id = Column(String, ForeignKey("smes.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    file_type = Column(String, nullable=False)
    raw_text = Column(Text, nullable=True)
    status = Column(String, CheckConstraint("status IN ('processing', 'processed', 'failed')"), nullable=False)
    exposable = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    sme = relationship("SME", back_populates="materials")
    chunks = relationship("MaterialChunk", back_populates="material", cascade="all, delete")


class MaterialChunk(Base):
    __tablename__ = "material_chunks"

    id = Column(String, primary_key=True)
    material_id = Column(String, ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(1024), nullable=True)

    __table_args__ = (UniqueConstraint("material_id", "chunk_index"),)

    material = relationship("Material", back_populates="chunks")
