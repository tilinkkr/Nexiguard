const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize DB
const dbPath = path.resolve(__dirname, '../../audit.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tokenId TEXT,
            action TEXT,
            actor TEXT,
            info TEXT,
            analysisHash TEXT,
            txid TEXT,
            timestamp TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS tokens (
            tokenId TEXT PRIMARY KEY,
            name TEXT,
            symbol TEXT,
            trust_score INTEGER,
            policyId TEXT,
            yaci_data TEXT,
            created_at TEXT,
            isDisputed INTEGER DEFAULT 0,
            source TEXT DEFAULT 'simulation'
        )`);

        // Attempt to add source column if it doesn't exist (migration)
        db.run(`ALTER TABLE tokens ADD COLUMN source TEXT DEFAULT 'simulation'`, (err) => {
            // Ignore error if column already exists
        });

        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tokenId TEXT,
            reporterId TEXT,
            text TEXT,
            timestamp TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS votes (
            tokenId TEXT PRIMARY KEY,
            agree INTEGER DEFAULT 0,
            disagree INTEGER DEFAULT 0
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS identities (
            address TEXT PRIMARY KEY,
            username TEXT,
            astrology TEXT,
            traits TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS hype_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            policyId TEXT NOT NULL,
            tokenName TEXT,
            hypeScore INTEGER NOT NULL,
            socialMentions INTEGER DEFAULT 0,
            searchTrends INTEGER DEFAULT 0,
            communityActivity INTEGER DEFAULT 0,
            priceChange REAL,
            volume24h INTEGER DEFAULT 0,
            currentPrice REAL,
            ratio REAL,
            status TEXT,
            risk TEXT,
            message TEXT,
            explanation TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            expiresAt DATETIME,
            FOREIGN KEY (policyId) REFERENCES tokens(policyId)
        )`);

        db.run(`CREATE INDEX IF NOT EXISTS idx_hype_policyId ON hype_metrics(policyId)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_hype_timestamp ON hype_metrics(timestamp)`);

        db.run(`CREATE TABLE IF NOT EXISTS mpm_metrics (
            policy_id TEXT PRIMARY KEY,
            token_symbol TEXT,
            window_min INTEGER NOT NULL,
            mpm REAL NOT NULL,
            sentiment TEXT NOT NULL,
            sample_size INTEGER NOT NULL,
            last_updated TEXT NOT NULL
        )`);
    });
}

// --- Audit Logs ---

function insertAuditLog(log) {
    return new Promise((resolve, reject) => {
        const { tokenId, action, actor, info, analysisHash, txid, timestamp } = log;
        const sql = `INSERT INTO audit_logs (tokenId, action, actor, info, analysisHash, txid, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [tokenId, action, actor, info, analysisHash, txid, timestamp], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, ...log });
        });
    });
}

function getAuditLogs(tokenId) {
    return new Promise((resolve, reject) => {
        const sql = tokenId
            ? `SELECT * FROM audit_logs WHERE tokenId = ? ORDER BY timestamp DESC`
            : `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100`;
        db.all(sql, tokenId ? [tokenId] : [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// --- Tokens ---

function insertToken(token) {
    return new Promise((resolve, reject) => {
        const { tokenId, name, symbol, trust_score, policyId, yaci_data, created_at, source } = token;
        const sql = `INSERT INTO tokens (tokenId, name, symbol, trust_score, policyId, yaci_data, created_at, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [tokenId, name, symbol, trust_score, policyId, JSON.stringify(yaci_data), created_at, source || 'simulation'], function (err) {
            if (err) reject(err);
            else resolve(token);
        });
    });
}

function getToken(tokenId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM tokens WHERE tokenId = ?`;
        db.get(sql, [tokenId], (err, row) => {
            if (err) reject(err);
            else if (row) {
                row.yaci_data = JSON.parse(row.yaci_data || '{}');
                row.isDisputed = !!row.isDisputed;
                resolve(row);
            } else {
                resolve(null);
            }
        });
    });
}

function getTokenByPolicyId(policyId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM tokens WHERE policyId = ?`;
        db.get(sql, [policyId], (err, row) => {
            if (err) reject(err);
            else if (row) {
                row.yaci_data = JSON.parse(row.yaci_data || '{}');
                row.isDisputed = !!row.isDisputed;
                resolve(row);
            } else {
                resolve(null);
            }
        });
    });
}

function getAllTokens() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM tokens ORDER BY created_at DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else {
                const tokens = rows.map(row => ({
                    ...row,
                    yaci_data: JSON.parse(row.yaci_data || '{}'),
                    isDisputed: !!row.isDisputed
                }));
                resolve(tokens);
            }
        });
    });
}

function updateTokenTrust(tokenId, trust_score, isDisputed) {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE tokens SET trust_score = ?, isDisputed = ? WHERE tokenId = ?`;
        db.run(sql, [trust_score, isDisputed ? 1 : 0, tokenId], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

// --- Reports ---

function insertReport(report) {
    return new Promise((resolve, reject) => {
        const { tokenId, reporterId, text, timestamp } = report;
        const sql = `INSERT INTO reports (tokenId, reporterId, text, timestamp) VALUES (?, ?, ?, ?)`;
        db.run(sql, [tokenId, reporterId, text, timestamp], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, ...report });
        });
    });
}

function getReports(tokenId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM reports WHERE tokenId = ?`;
        db.all(sql, [tokenId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// --- Votes ---

function getVote(tokenId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM votes WHERE tokenId = ?`;
        db.get(sql, [tokenId], (err, row) => {
            if (err) reject(err);
            else resolve(row || { tokenId, agree: 0, disagree: 0 });
        });
    });
}

function updateVote(tokenId, voteType) {
    return new Promise((resolve, reject) => {
        // Upsert logic
        const sql = `INSERT INTO votes (tokenId, agree, disagree) VALUES (?, ?, ?) 
                     ON CONFLICT(tokenId) DO UPDATE SET 
                     agree = agree + (CASE WHEN excluded.agree > 0 THEN 1 ELSE 0 END),
                     disagree = disagree + (CASE WHEN excluded.disagree > 0 THEN 1 ELSE 0 END)`;

        const agree = voteType === 'agree' ? 1 : 0;
        const disagree = voteType === 'disagree' ? 1 : 0;

        db.run(sql, [tokenId, agree, disagree], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

// --- Identities ---

function saveIdentity(identity) {
    return new Promise((resolve, reject) => {
        const { address, username, astrology, traits } = identity;
        const sql = `INSERT OR REPLACE INTO identities (address, username, astrology, traits) VALUES (?, ?, ?, ?)`;
        db.run(sql, [address, username, astrology, JSON.stringify(traits)], function (err) {
            if (err) reject(err);
            else resolve(identity);
        });
    });
}

function getIdentity(address) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM identities WHERE address = ?`;
        db.get(sql, [address], (err, row) => {
            if (err) reject(err);
            else if (row) {
                row.traits = JSON.parse(row.traits || '[]');
                resolve(row);
            } else {
                resolve(null);
            }
        });
    });
}

// --- Hype Metrics ---

function insertHypeMetric(metric) {
    return new Promise((resolve, reject) => {
        const {
            policyId, tokenName, hypeScore, socialMentions, searchTrends,
            communityActivity, priceChange, volume24h, currentPrice,
            ratio, status, risk, message, explanation
        } = metric;

        const sql = `INSERT INTO hype_metrics (
            policyId, tokenName, hypeScore, socialMentions, searchTrends,
            communityActivity, priceChange, volume24h, currentPrice,
            ratio, status, risk, message, explanation, expiresAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+5 minutes'))`;

        db.run(sql, [
            policyId, tokenName, hypeScore, socialMentions, searchTrends,
            communityActivity, priceChange, volume24h, currentPrice,
            ratio, status, risk, message, explanation
        ], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, ...metric });
        });
    });
}

// --- MPM Metrics ---

function insertMPM(record) {
    return new Promise((resolve, reject) => {
        const { policyId, tokenSymbol, windowMinutes, mpm, sentiment, sampleSize, lastUpdated } = record;
        const sql = `INSERT OR REPLACE INTO mpm_metrics (
            policy_id, token_symbol, window_min, mpm, sentiment, sample_size, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [policyId, tokenSymbol, windowMinutes, mpm, sentiment, sampleSize, lastUpdated], function (err) {
            if (err) reject(err);
            else resolve(record);
        });
    });
}

function getMPM(policyId) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM mpm_metrics WHERE policy_id = ?`;
        db.get(sql, [policyId], (err, row) => {
            if (err) reject(err);
            else if (row) {
                // Map DB columns back to object properties
                resolve({
                    policyId: row.policy_id,
                    tokenSymbol: row.token_symbol,
                    windowMinutes: row.window_min,
                    mpm: row.mpm,
                    sentiment: row.sentiment,
                    sampleSize: row.sample_size,
                    lastUpdated: row.last_updated
                });
            } else {
                resolve(null);
            }
        });
    });
}

module.exports = {
    insertAuditLog, getAuditLogs,
    insertToken, getToken, getTokenByPolicyId, getAllTokens, updateTokenTrust,
    insertReport, getReports,
    getVote, updateVote,
    saveIdentity, getIdentity,
    insertHypeMetric,
    insertMPM, getMPM
};
