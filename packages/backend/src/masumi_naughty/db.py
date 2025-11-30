import sqlite3, os, json, datetime
from typing import Optional, Dict, Any

# Reuse the same DB path logic as mpm_db.py
DB_PATH = os.getenv("NEXGUARD_DB_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "audit.db"))

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    with conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS naughty_wallets (
          wallet       TEXT NOT NULL,
          policy_id    TEXT NOT NULL,
          classification TEXT,
          sass_score   INTEGER,
          evidence     TEXT,
          decision_hash TEXT,
          onchain_tx   TEXT,
          timestamp    TEXT,
          PRIMARY KEY (wallet, policy_id)
        );
        """)

def upsert_naughty_wallet(record: Dict[str, Any]) -> None:
    init_db()
    conn = get_conn()
    with conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO naughty_wallets
              (wallet, policy_id, classification, sass_score, evidence, decision_hash, onchain_tx, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["wallet"],
                record["policy_id"],
                record["classification"],
                record["sass_score"],
                json.dumps(record.get("evidence", {})),
                record.get("decision_hash"),
                record.get("onchain_tx"),
                record.get("timestamp"),
            ),
        )

def fetch_naughty_wallet(wallet: str, policy_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM naughty_wallets WHERE wallet = ? AND policy_id = ?", (wallet, policy_id)
    ).fetchone()
    if not row:
        return None
    d = dict(row)
    if d.get("evidence"):
        try:
            d["evidence"] = json.loads(d["evidence"])
        except:
            d["evidence"] = {}
    return d

def update_onchain_tx(wallet: str, policy_id: str, tx_hash: str) -> bool:
    init_db()
    conn = get_conn()
    with conn:
        cursor = conn.execute(
            "UPDATE naughty_wallets SET onchain_tx = ? WHERE wallet = ? AND policy_id = ?",
            (tx_hash, wallet, policy_id)
        )
        return cursor.rowcount > 0
