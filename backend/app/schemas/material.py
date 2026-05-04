from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MaterialRead(BaseModel):
    material_id: str
    sme_id: str
    title: str
    file_type: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

class MaterialSummary(BaseModel):
    material_id: str
    title: str
    file_type: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

class MaterialListResponse(BaseModel):
    materials: list[MaterialSummary]
