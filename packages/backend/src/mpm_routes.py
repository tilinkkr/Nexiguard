from fastapi import APIRouter, HTTPException
from .mpm_db import fetch_mpm, upsert_mpm
from .services.mpm_agent import analyze_mpm_for_token
from .services.social_scraper import fetch_social_metrics

router = APIRouter(prefix="/api/mpm", tags=["mpm"])

@router.get("/{policy_id}")
async def get_mpm(policy_id: str):
    rec = fetch_mpm(policy_id)
    if not rec:
        raise HTTPException(status_code=404, detail="MPM not found")
    return rec

@router.post("/{policy_id}/refresh")
async def refresh_mpm(policy_id: str):
    # Fetch "real" (simulated) social data
    # In a real app, we'd resolve the symbol from the policy_id first
    symbol = "TEST" # Placeholder, ideally fetch from DB using policy_id
    
    recent_mentions = await fetch_social_metrics(symbol, window_min=5)
    
    social_context = {
        "policy_id": policy_id,
        "symbol": symbol,
        "recent_mentions": recent_mentions,
    }
    
    analysis = await analyze_mpm_for_token(social_context)
    record = {
        "policyId": policy_id,
        "tokenSymbol": social_context["symbol"],
        "windowMinutes": 5,
        "mpm": analysis["mpm"],
        "sentiment": analysis["sentiment"],
        "sampleSize": analysis["sampleSize"],
        "breakdown": recent_mentions, # Add breakdown data
    }
    upsert_mpm(record)
    return record
