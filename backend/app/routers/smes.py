from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.middleware.auth import verify_token
from app.repositories.sme_repository import SMERepository
from app.schemas.sme import SMECreate, SMERead, SMEListResponse

router = APIRouter(prefix="/api/v1", dependencies=[Depends(verify_token)])


@router.post("/smes", response_model=SMERead, status_code=201)
async def create_sme(body: SMECreate, db: AsyncSession = Depends(get_db)):
    repo = SMERepository(db)
    sme = await repo.create(
        name=body.name,
        specialization=body.specialization,
        sub_areas=body.sub_areas,
        contact_email=body.contact_email,
        role=body.role,
        department=body.department,
        responsible_products=body.responsible_products,
        sub_expertise=body.sub_expertise,
    )

    # Hook for Person D: embed SME profile for semantic routing
    # D will replace this block with the real EmbeddingService call
    try:
        from app.services.embedding_service import EmbeddingService  # D provides this
        import asyncio
        embedding_service = EmbeddingService()
        asyncio.create_task(embedding_service.embed_sme(sme.sme_id, db))
    except ImportError:
        pass  # EmbeddingService not yet available - safe to skip during development

    return sme


@router.get("/smes", response_model=SMEListResponse)
async def list_smes(db: AsyncSession = Depends(get_db)):
    repo = SMERepository(db)
    smes = await repo.list_all()
    return SMEListResponse(smes=smes)


@router.get("/smes/{sme_id}", response_model=SMERead)
async def get_sme(sme_id: str, db: AsyncSession = Depends(get_db)):
    repo = SMERepository(db)
    sme = await repo.get(sme_id)
    if not sme:
        raise HTTPException(status_code=404, detail="SME not found")
    return sme