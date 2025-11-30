from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import os
from .service import analyze_wallet

router = APIRouter(prefix="/masumi/naughty", tags=["masumi_naughty"])

class AnalyzeRequest(BaseModel):
    wallet: str
    policy_id: Optional[str] = None
    force: bool = False

async def verify_key(x_masumi_key: str = Header(...)):
    expected_key = os.getenv("MASUMI_KEY")
    if not expected_key:
        # If key is not configured on server, fail safe (or allow all? safer to fail)
        raise HTTPException(status_code=500, detail="Server misconfiguration: MASUMI_KEY not set")
    
    if x_masumi_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid Masumi Key")
    return x_masumi_key

@router.post("/analyze")
async def analyze_endpoint(req: AnalyzeRequest, key: str = Depends(verify_key)):
    """
    Protected endpoint to analyze a wallet.
    Requires X-MASUMI-KEY header.
    """
    result = await analyze_wallet(req.wallet, req.policy_id)
    return result

from .db import fetch_naughty_wallet, update_onchain_tx

@router.get("/{wallet}")
async def get_naughty_wallet(wallet: str, policy_id: Optional[str] = None):
    # If policy_id is not provided, we might need to handle list or default.
    # For now, let's require it or just pick one if simple. 
    # But the prompt said "curl .../{wallet}", implying maybe just wallet lookup?
    # The DB PK is (wallet, policy_id). Let's assume policy_id is passed as query param or we just return list?
    # The prompt example: curl -s "http://localhost:8000/masumi/naughty/addr_test1abc..."
    # Let's support query param for policy_id.
    
    # Actually, if policy_id is required for PK, we need it. 
    # Let's assume for this demo we default to "000policy" if not provided, or return 404.
    if not policy_id:
        policy_id = "000policy" # Fallback for demo simplicity matching the curl example
        
    rec = fetch_naughty_wallet(wallet, policy_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    return rec

class ConfirmTxRequest(BaseModel):
    wallet: str
    policy_id: str
    tx_hash: str

@router.post("/confirm-tx")
async def confirm_tx_endpoint(req: ConfirmTxRequest, key: str = Depends(verify_key)):
    success = update_onchain_tx(req.wallet, req.policy_id, req.tx_hash)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found to update")
    return {"status": "updated", "tx_hash": req.tx_hash}
