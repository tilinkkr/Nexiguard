import mpm_db
import datetime

def test_mpm_flow():
    print("Testing MPM DB Flow...")
    
    # 1. Create a fake record
    fake_record = {
        "policyId": "test_policy_123",
        "tokenSymbol": "TEST",
        "windowMinutes": 5,
        "mpm": 42.0,
        "sentiment": "BULLISH",
        "sampleSize": 100
    }
    
    print(f"Upserting record: {fake_record}")
    mpm_db.upsert_mpm(fake_record)
    
    # 2. Fetch it back
    print("Fetching record back...")
    fetched = mpm_db.fetch_mpm("test_policy_123")
    
    if fetched:
        print("Success! Fetched record:")
        print(fetched)
        assert fetched["policy_id"] == "test_policy_123"
        assert fetched["mpm"] == 42.0
    else:
        print("Failed! Record not found.")

if __name__ == "__main__":
    test_mpm_flow()
