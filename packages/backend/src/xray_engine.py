import os
import json
import datetime
import aiohttp
import asyncio
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from .bundle_db_sqlite import get_connection, BUNDLE_TABLE

load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BLOCKFROST_PROJECT_ID = os.getenv('BLOCKFROST_PROJECT_ID')
BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0"
TIMEOUT_SECONDS = 8

# Simple Metrics
class Metrics:
    cache_hits = 0
    cache_misses = 0
    api_calls = 0
    errors = 0

metrics = Metrics()

async def fetch_blockfrost(endpoint: str) -> Dict[str, Any]:
    if not BLOCKFROST_PROJECT_ID:
        raise Exception("Missing Blockfrost Key")
    
    headers = {"project_id": BLOCKFROST_PROJECT_ID}
    
    try:
        metrics.api_calls += 1
        logger.debug(f"Calling Blockfrost: {endpoint}")
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BLOCKFROST_URL}{endpoint}", headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                elif response.status == 404:
                    return None
                else:
                    raise Exception(f"Blockfrost API Error: {response.status}")
    except asyncio.TimeoutError:
        logger.error(f"Blockfrost API Timeout: {endpoint}")
        raise Exception("Blockfrost API Timeout")
    except Exception as e:
        logger.error(f"Blockfrost API Error: {e}")
        raise

def get_cached_result(policy_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cursor = conn.execute(f"SELECT payload, timestamp FROM {BUNDLE_TABLE} WHERE policy_id = ?", (policy_id,))
        row = cursor.fetchone()
        if row:
            # Check if cache is fresh (24h)
            cached_time = datetime.datetime.fromisoformat(row["timestamp"])
            if datetime.datetime.utcnow() - cached_time < datetime.timedelta(hours=24):
                data = json.loads(row["payload"])
                data["cached"] = True
                metrics.cache_hits += 1
                logger.info(f"Cache HIT for {policy_id}")
                return data
    except Exception as e:
        logger.error(f"Cache read error: {e}")
    finally:
        conn.close()
    
    metrics.cache_misses += 1
    logger.info(f"Cache MISS for {policy_id}")
    return None

def cache_result(policy_id: str, data: Dict[str, Any]):
    conn = get_connection()
    try:
        payload = json.dumps(data)
        timestamp = datetime.datetime.utcnow().isoformat()
        conn.execute(f"""
            INSERT OR REPLACE INTO {BUNDLE_TABLE} (policy_id, payload, timestamp)
            VALUES (?, ?, ?)
        """, (policy_id, payload, timestamp))
        conn.commit()
    except Exception as e:
        logger.error(f"Cache write error: {e}")
    finally:
        conn.close()

async def analyze_policy(policy_id: str) -> Dict[str, Any]:
    # 1. Check Cache
    cached = get_cached_result(policy_id)
    if cached:
        return cached

    # 2. Fallback if no key
    if not BLOCKFROST_PROJECT_ID:
        logger.warning("Blockfrost Key Missing - Using Fallback")
        return {
            "policy_id": policy_id,
            "type": "Unknown",
            "risk_level": "LOW",
            "risk_score": 10,
            "details": {},
            "explanation": "Blockfrost API key not set — running in fallback mode",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cached": False
        }

    try:
        # 3. Query Blockfrost with Timeout
        # Try /scripts/{hash} first
        script = await asyncio.wait_for(fetch_blockfrost(f"/scripts/{policy_id}"), timeout=TIMEOUT_SECONDS)
        
        result = {
            "policy_id": policy_id,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cached": False
        }

        if script:
            # It's a known script (Plutus or Timelock)
            script_type = script.get('type')
            
            if 'plutus' in script_type:
                result.update({
                    "type": "Plutus Smart Contract",
                    "risk_level": "HIGH",
                    "risk_score": 85,
                    "explanation": "Complex Smart Contract. Code is compiled and opaque. Requires audit.",
                    "details": script
                })
            elif script_type == 'timelock':
                # Fetch JSON for timelock
                script_json = await asyncio.wait_for(fetch_blockfrost(f"/scripts/{policy_id}/json"), timeout=TIMEOUT_SECONDS)
                result.update({
                    "type": "Native Timelock Script",
                    "risk_level": "LOW",
                    "risk_score": 15,
                    "explanation": "Transparent rules defined on-chain.",
                    "details": script_json or script
                })
                
                # Heuristic: Check for multisig
                if script_json and 'type' in script_json and script_json['type'] == 'all':
                     result["type"] = "Multi-Sig Script"
                     result["risk_level"] = "MEDIUM"
                     result["risk_score"] = 40
                     result["explanation"] = "Requires multiple signatures. Safer than single key."

            else:
                result.update({
                    "type": f"Script: {script_type}",
                    "risk_level": "MEDIUM",
                    "risk_score": 50,
                    "explanation": "Unknown script type.",
                    "details": script
                })
        else:
            # 404 on /scripts means it's likely a simple Native Asset (Key Policy)
            result.update({
                "type": "Native Asset",
                "risk_level": "LOW",
                "risk_score": 10,
                "explanation": "Standard Native Asset locked by a private key.",
                "details": {"note": "No script hash found on-chain, implies simple key policy."}
            })

        # 4. Cache Result
        cache_result(policy_id, result)
        return result

    except asyncio.TimeoutError:
        metrics.errors += 1
        logger.error(f"Analysis Timeout for {policy_id}")
        return {
            "policy_id": policy_id,
            "type": "Error",
            "risk_level": "UNKNOWN",
            "risk_score": 0,
            "explanation": "Analysis timed out. External API slow.",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cached": False
        }
    except Exception as e:
        metrics.errors += 1
        logger.error(f"Analysis Error: {e}")
        return {
            "policy_id": policy_id,
            "type": "Error",
            "risk_level": "UNKNOWN",
            "risk_score": 0,
            "explanation": f"Analysis failed: {str(e)}",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cached": False
        }
