import pytest
import asyncio
from unittest.mock import patch, MagicMock
from packages.backend.src.xray_engine import analyze_policy, metrics

@pytest.mark.asyncio
async def test_analyze_policy_fallback():
    # Test fallback when no key is present
    with patch('packages.backend.src.xray_engine.BLOCKFROST_PROJECT_ID', None):
        result = await analyze_policy("test_policy")
        assert result["type"] == "Unknown"
        assert "Blockfrost API key not set" in result["explanation"]

@pytest.mark.asyncio
async def test_analyze_policy_cache_hit():
    # Mock cache to return a result
    mock_cached_data = {
        "policy_id": "test_policy",
        "type": "Cached Asset",
        "risk_level": "LOW",
        "cached": True
    }
    
    with patch('packages.backend.src.xray_engine.get_cached_result', return_value=mock_cached_data):
        # Reset metrics
        metrics.cache_hits = 0
        
        result = await analyze_policy("test_policy")
        
        assert result["type"] == "Cached Asset"
        assert result["cached"] is True
        # Verify metric incremented (implementation detail, but good to check)
        # Note: In the actual code, we increment before returning, so this should pass if logic is correct
        # However, since we mock get_cached_result which contains the increment logic, 
        # we can't test the increment unless we mock the DB call inside it.
        # For this unit test, we just verify the return value.

@pytest.mark.asyncio
async def test_analyze_policy_timeout():
    # Mock fetch_blockfrost to raise TimeoutError
    
    async def mock_fetch_timeout(*args, **kwargs):
        # Simulate delay longer than timeout (though we mock the wait_for usually)
        # Here we just raise the error directly to simulate what wait_for would do
        raise asyncio.TimeoutError()
    
    with patch('packages.backend.src.xray_engine.BLOCKFROST_PROJECT_ID', "mock_key"):
        # We need to patch asyncio.wait_for to raise TimeoutError, OR patch fetch_blockfrost and let wait_for handle it.
        # Since we use asyncio.wait_for(fetch_blockfrost(...)), if fetch_blockfrost hangs, wait_for raises.
        # To test the exception handling in analyze_policy, we can just mock wait_for to raise TimeoutError.
        
        with patch('asyncio.wait_for', side_effect=asyncio.TimeoutError):
             with patch('packages.backend.src.xray_engine.get_cached_result', return_value=None):
                 result = await analyze_policy("test_policy")
                 assert result["type"] == "Error"
                 assert "timed out" in result["explanation"]

@pytest.mark.asyncio
async def test_analyze_policy_plutus():
    # Mock Blockfrost response for a Plutus script
    mock_script = {"type": "plutusV1", "script_hash": "test_policy"}
    
    async def mock_fetch(*args, **kwargs):
        return mock_script
    
    with patch('packages.backend.src.xray_engine.BLOCKFROST_PROJECT_ID', "mock_key"):
        with patch('packages.backend.src.xray_engine.fetch_blockfrost', side_effect=mock_fetch):
            with patch('packages.backend.src.xray_engine.get_cached_result', return_value=None):
                with patch('packages.backend.src.xray_engine.cache_result'):
                    result = await analyze_policy("test_policy")
                    assert result["type"] == "Plutus Smart Contract"
                    assert result["risk_level"] == "HIGH"
