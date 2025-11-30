import json
import asyncio
from typing import Dict, Any

async def run_masumi_task(system_prompt: str, user_payload: Dict[str, Any]) -> Any:
    """
    Mock implementation of Masumi Task Runner.
    In production, this would call the Gemini API or the CrewAI agent.
    """
    print(f"[MasumiClient] Running task with prompt length: {len(system_prompt)}")
    print(f"[MasumiClient] Payload: {user_payload}")
    
    # Simulate processing delay
    await asyncio.sleep(0.5)
    
    # Mock response based on the prompt's request for JSON
    # We return a string that looks like the JSON requested
    return {
        "text": json.dumps({
            "mpm": 42.0,
            "sentiment": "BULLISH",
            "sampleSize": 180
        })
    }
