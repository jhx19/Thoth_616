from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")

# These will be implemented by Person C
@router.post("/smes/{sme_id}/interviews", status_code=201)
async def create_interview(sme_id: str):
    return {"message": "To be implemented by Person C"}

@router.get("/smes/{sme_id}/interviews")
async def list_interviews(sme_id: str):
    return {"interviews": []}

@router.post("/interviews/{interview_id}/turns")
async def add_turn(interview_id: str):
    return {"message": "To be implemented by Person C"}

@router.get("/interviews/{interview_id}")
async def get_interview(interview_id: str):
    return {"message": "To be implemented by Person C"}

@router.post("/smes/{sme_id}/materials", status_code=201)
async def upload_material(sme_id: str):
    return {"message": "To be implemented by Person C"}

@router.get("/smes/{sme_id}/materials")
async def list_materials(sme_id: str):
    return {"materials": []}

@router.post("/smes/{sme_id}/knowledge/synthesize", status_code=201)
async def synthesize(sme_id: str):
    return {"message": "To be implemented by Person C"}

# This will be implemented by Person D
@router.post("/query")
async def query():
    return {"message": "To be implemented by Person D"}