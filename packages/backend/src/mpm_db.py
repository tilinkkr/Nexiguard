from typing import Optional, Dict, Any
import sqlite3, os, json, datetime

# Use the same DB path as the Node app (audit.db is in the parent of src, so ../../audit.db relative to src)
# But this script is in src, so it should be ../../audit.db
# The user's snippet used "./nexguard.db", but I should align it with the existing app "audit.db"
# db.js uses: path.resolve(__dirname, '../../audit.db')
# If this file is in packages/backend/src/mpm_db.py, then ../../audit.db is correct.

DB_PATH = os.getenv("NEXGUARD_DB_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "audit.db"))

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    with conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS mpm_metrics (
          policy_id    TEXT PRIMARY KEY,
          token_symbol TEXT,
          window_min   INTEGER NOT NULL,
          mpm          REAL NOT NULL,
          sentiment    TEXT NOT NULL,
          sample_size  INTEGER NOT NULL,
          last_updated TEXT NOT NULL,
          breakdown    TEXT
        );
        """)
        # Migration: Add column if missing (simple check)
        try:
            conn.execute("ALTER TABLE mpm_metrics ADD COLUMN breakdown TEXT")
        except sqlite3.OperationalError:
            pass # Column likely exists

def upsert_mpm(record: Dict[str, Any]) -> None:
    init_db() # Ensure table exists
    conn = get_conn()
    with conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO mpm_metrics
              (policy_id, token_symbol, window_min, mpm, sentiment, sample_size, last_updated, breakdown)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["policyId"],
                record["tokenSymbol"],
                record["windowMinutes"],
                record["mpm"],
                record["sentiment"],
                record["sampleSize"],
                datetime.datetime.utcnow().isoformat(),
                json.dumps(record.get("breakdown", [])),
            ),
        )

def fetch_mpm(policy_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM mpm_metrics WHERE policy_id = ?", (policy_id,)
    ).fetchone()
    if not row:
        return None
    d = dict(row)
    if d.get("breakdown"):
        try:
            d["breakdown"] = json.loads(d["breakdown"])
        except:
            d["breakdown"] = []
    return d
