from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class SMECreate(BaseModel):
    name: str
    specialization: str
    sub_areas: list[str]
    contact_email: str
    role: Optional[str] = None
    department: Optional[str] = None
    responsible_products: Optional[list[str]] = None
    sub_expertise: Optional[list[str]] = None

class SMERead(BaseModel):
    sme_id: str
    name: str
    specialization: str
    sub_areas: list[str]
    contact_email: str
    role: Optional[str] = None
    department: Optional[str] = None
    responsible_products: Optional[list[str]] = None
    sub_expertise: Optional[list[str]] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class SMEListResponse(BaseModel):
    smes: list[SMERead]
