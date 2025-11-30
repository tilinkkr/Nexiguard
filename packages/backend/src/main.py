from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os, time
from datetime import datetime
from dotenv import load_dotenv

# Load .env from packages/backend/.env (parent of src)
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

from .models import BundleRequest, BundleAnalysisResult
from .insider_engine import analyze_bundle
from . import mpm_routes
from .masumi_naughty import routes as masumi_naughty_routes
from .xray_engine import analyze_policy

app = FastAPI(title="NexGuard Bundle Inspector", version="0.2")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mpm_routes.router)
app.include_router(masumi_naughty_routes.router)

@app.get("/analyze/bundle/{policy_id}", response_model=BundleAnalysisResult)
async def analyze_bundle_route(policy_id: str):
    start = time.time()
    try:
        BundleRequest(policy_id=policy_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    try:
        result = await analyze_bundle(policy_id)
        return result
    except Exception:
        raise HTTPException(status_code=500, detail="bundle analysis failed")

@app.get("/xray/{policy_id}")
async def xray(policy_id: str):
    return await analyze_policy(policy_id)
