from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

bearer_scheme = HTTPBearer(auto_error=True)

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
):
    from app.config import settings
    if credentials.credentials != settings.BENCHMARK_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid token")