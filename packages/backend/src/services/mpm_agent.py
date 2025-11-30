from typing import Dict, Any
import json
from .masumi_client import run_masumi_task

async def analyze_mpm_for_token(token_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    token_context might include: {
      "policy_id": "...",
      "symbol": "WIF",
      "recent_mentions": [
        {"platform": "x", "count": 120, "window_min": 5},
        {"platform": "telegram", "count": 60, "window_min": 5},
      ]
    }
    """
    system_prompt = (
        "You are the MPM (Memes-Per-Minute) analyst. "
        "Given recent social mention counts over a fixed time window, "
        "compute:\n"
        "- mpm: total memes per minute (float)\n"
        "- sentiment: one of BULLISH, NEUTRAL, PANIC\n"
        "- sampleSize: integer total mentions.\n"
        "Return ONLY JSON like "
        '{"mpm": 42.0, "sentiment": "BULLISH", "sampleSize": 180}. '
        "No other text."
    )

    # Temporary input: Fake recent mentions if not provided
    if "recent_mentions" not in token_context:
        token_context["recent_mentions"] = [
            {"platform": "x", "count": 120, "window_min": 5},
            {"platform": "telegram", "count": 60, "window_min": 5}
        ]

    resp = await run_masumi_task(system_prompt=system_prompt, user_payload=token_context)
    
    # Parse JSON from resp.text safely
    try:
        # Assuming resp is a dict with 'text' field as per masumi_client mock
        # If run_masumi_task returns an object with .text attribute, adjust accordingly.
        # Here we assume dict for simplicity of the mock.
        text_content = resp.get("text", "{}")
        # Clean up potential markdown code blocks if the LLM adds them
        text_content = text_content.replace("```json", "").replace("```", "").strip()
        
        result = json.loads(text_content)
        return result
    except Exception as e:
        print(f"[MPM Agent] Error parsing response: {e}")
        return {"mpm": 0.0, "sentiment": "NEUTRAL", "sampleSize": 0}
