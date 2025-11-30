import asyncio
import sys
import os

# Add parent directory to path to allow relative imports if run from services dir
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# However, since we used relative imports in mpm_agent (.masumi_client),
# we need to run this as a module or adjust imports.
# For simplicity in this test script, we will mock the import or run from parent.
# Better yet, let's just use absolute imports in the test script and run it from src.

# We will run this script from packages/backend/src/services
# But mpm_agent uses `from .masumi_client` which requires it to be in a package.
# So we should run from packages/backend/src and import services.mpm_agent

from services.mpm_agent import analyze_mpm_for_token

async def test():
    print("Testing MPM Agent...")
    context = {
        "policy_id": "test_policy",
        "symbol": "TEST"
    }
    
    result = await analyze_mpm_for_token(context)
    print("Result:", result)
    
    assert "mpm" in result
    assert "sentiment" in result
    assert "sampleSize" in result
    print("Test Passed!")

if __name__ == "__main__":
    asyncio.run(test())
