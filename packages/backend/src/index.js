// === BOOT GUARD - Enhanced Diagnostic Logging ===
Error.stackTraceLimit = 100;
const bootFs = require('fs'), bootCrypto = require('crypto');
console.log('[BOOT] Starting server.js', new Date().toISOString());
process.on('uncaughtException', (err) => console.error('[FATAL] uncaughtException', err && err.stack ? err.stack : err));
process.on('unhandledRejection', (r) => console.error('[FATAL] unhandledRejection', r && r.stack ? r.stack : r));
try {
    console.log('[BOOT] index.js md5:', bootCrypto.createHash('md5').update(bootFs.readFileSync(__filename, 'utf8')).digest('hex'));
} catch (e) {
    console.log('[BOOT] md5 failed', e);
}

const express = require('express');
const cors = require('cors');
const {
    insertToken, getToken, getAllTokens, updateTokenTrust,
    insertAuditLog, getAuditLogs,
    insertReport, getReports,
    getVote, updateVote,
    saveIdentity, getIdentity
} = require('./services/db');
const { getAssetDetails, getAssetTxs } = require('./models/yaci_simulation');
const { fetchTokenMetadata } = require('./services/yaci');
const { explainRisk } = require('./services/masumi');
const { generateMemeCoin, generateBatch } = require('./memeFactory');
const { fetchLatestAssets, healthCheck, fetchRealToken } = require('./blockfrostService');
const { enrichWithRugProbability } = require('./utils/rugLabels');
const { fetchRealTokenData, isConfigured: isBlockfrostConfigured } = require('./services/tokenDataFetcher');
const { analyzeWithMasumi } = require('./services/masumiAgent');
const logger = require('./services/logger');
require('dotenv').config();

const proofRoutes = require('./routes/proofRoutes');
const incidentRoutes = require('./routes/incidentRoutes');

const app = express();
app.use(cors());
app.use(express.json());



// Mount health and safety routes first (minimal dependencies)
try {
    const healthAndSafety = require('./routes/_healthAndSafety');
    app.use(healthAndSafety);
    console.log('[BOOT] Mounted healthAndSafety');
} catch (err) {
    console.error('[BOOT] healthAndSafety mount failed', err && err.stack ? err.stack : err);
}

// Mount Proof Routes
app.use('/api/v1', proofRoutes);
app.use('/api/incident', incidentRoutes);

const { getMPM, refreshMPM } = require('./services/mpmService');

// MPM Lab Routes
app.get('/api/mpm/:policyId', (req, res) => {
    const record = getMPM(req.params.policyId);
    if (!record) {
        return res.status(404).json({ error: 'MPM record not found' });
    }
    res.json(record);
});

app.post('/api/mpm/:policyId/refresh', async (req, res) => {
    try {
        const { tokenSymbol } = req.body;
        const record = await refreshMPM(req.params.policyId, tokenSymbol);
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Routes moved to after specific endpoints to avoid shadowing
// Request Logging Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log(`DEBUG: Gemini API Key Status: ${GEMINI_API_KEY ? 'Present (' + GEMINI_API_KEY.length + ' chars)' : 'MISSING'}`);
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "placeholder_key");

// --- Meme Factory Storage ---
let memeCoins = [];
let factoryInterval = null;

// Generate initial batch
// Generate initial batch
memeCoins = generateBatch(10);
logger.info(`Meme Factory initialized with ${memeCoins.length} coins`);

// Auto-generation function
function startMemeFactory() {
    if (factoryInterval) return;

    factoryInterval = setInterval(() => {
        const newCoin = generateMemeCoin();
        memeCoins.unshift(newCoin); // Add to beginning

        // Keep only last 100 coins
        if (memeCoins.length > 100) {
            memeCoins = memeCoins.slice(0, 100);
        }

        logger.info(`Meme Factory generated: ${newCoin.name} (${newCoin.symbol}) - Trust: ${newCoin.trust_score}`);
    }, 5000); // Every 5 seconds

    logger.info('Meme Factory auto-generation started');
}

function stopMemeFactory() {
    if (factoryInterval) {
        clearInterval(factoryInterval);
        factoryInterval = null;
        logger.info('Meme Factory auto-generation stopped');
    }
}

// Global Stats Endpoint
app.get('/api/stats/global', async (req, res) => {
    try {
        // Calculate average trust from active meme coins
        const totalTrust = memeCoins.reduce((acc, coin) => acc + (coin.trust_score || coin.trustScore || 0), 0);
        const avgTrust = memeCoins.length > 0 ? Math.round(totalTrust / memeCoins.length) : 0;

        // Get counts (simulated + DB)
        const audits = 1240 + memeCoins.length; // Base + live count
        const scams = memeCoins.filter(c => (c.trustScore || 0) < 30).length + 42; // Base + live detection

        res.json({
            avgTrust,
            totalAudits: audits,
            scamsDetected: scams,
            activeTokens: memeCoins.length
        });
    } catch (err) {
        logger.error('Stats error', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Start factory automatically
startMemeFactory();

// Mount isolated hype routes
try {
    const hypeRoutes = require('./routes/hypeRoutes');
    app.use('/api', hypeRoutes);
    console.log('[BOOT] Mounted /api hypeRoutes');
} catch (err) {
    console.error('[BOOT] Failed to mount hypeRoutes:', err && err.stack ? err.stack : err);
}

// Mount risk routes
try {
    const riskRoutes = require('./routes/riskRoutes');
    app.use('/api', riskRoutes);
    console.log('[BOOT] Mounted riskRoutes at /api');
} catch (err) {
    console.error('[BOOT] Failed to mount riskRoutes:', err && err.stack ? err.stack : err);
}

// --- Blockfrost Real Tokens Cache ---
let realTokensCache = [];
let lastRealFetch = 0;
const CACHE_DURATION = 300000; // 5 minutes

// Check Blockfrost health on startup
if (process.env.BLOCKFROST_API_KEY) {
    healthCheck().then(healthy => {
        if (healthy) {
            logger.info('Blockfrost API connected successfully');
            console.log('[Blockfrost] API connected - will fetch real tokens');
        } else {
            logger.warn('Blockfrost API health check failed');
        }
    });
} else {
    logger.warn('BLOCKFROST_API_KEY not set - using simulated tokens only');
}

// --- Load Contract Deployment Info ---
let deploymentInfo = null;
try {
    deploymentInfo = require('./contracts/deployment.json');
    logger.info(`Contract loaded: ${deploymentInfo.scriptAddress} (${deploymentInfo.network})`);
    console.log(`[Contract] Script Hash: ${deploymentInfo.scriptHash}`);
    console.log(`[Contract] Script Address: ${deploymentInfo.scriptAddress}`);
    console.log(`[Contract] Network: ${deploymentInfo.network}`);
} catch (e) {
    logger.warn('Contract deployment info not found');
    console.warn('[Contract] No deployment info found - run: node scripts/deploy.js');
}



// --- Helper Functions ---

async function logAudit(event) {
    const entry = { ...event, timestamp: new Date().toISOString() };
    try {
        await insertAuditLog(entry);
        logger.info("Audit Log Saved to DB", entry);
    } catch (err) {
        logger.error("Failed to save audit log", { error: err.message });
    }
}

// --- Health Check ---
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// --- Auth Endpoints ---

app.get('/api/auth/nonce', (req, res) => {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: "Address required" });
    const nonce = "nonce_" + Math.random().toString(36).slice(2);
    res.json({ nonce });
});

app.post('/api/auth/wallet', (req, res) => {
    const { address, signature } = req.body;
    if (!address || !signature) return res.status(400).json({ error: "Address and signature required" });
    const token = "jwt_" + Math.random().toString(36).slice(2) + "_" + address.slice(0, 10);
    const user = { id: address, address, role: 'user' };
    res.json({ token, user });
});

app.post('/api/auth/login', (req, res) => {
    res.json(token);
});

app.post('/api/simulate/mint', async (req, res) => {
    const { name, symbol, creator } = req.body;
    if (!name || !symbol) return res.status(400).json({ error: "Name and symbol required" });

    const tokenId = "tok_" + Math.random().toString(36).slice(2, 12);
    const policyId = "policy" + Math.random().toString(36).slice(2, 18);
    const trust_score = 85 + Math.floor(Math.random() * 10); // High initial score for demo

    let yaci_data = {};
    let source = 'simulation';

    try {
        const metadata = await fetchTokenMetadata(policyId);
        yaci_data = metadata;
        source = metadata.source || 'simulation';
    } catch (err) {
        logger.warn("Failed to fetch metadata during mint", { error: err.message });
    }

    const token = {
        tokenId,
        name,
        symbol,
        trust_score,
        policyId,
        yaci_data,
        created_at: new Date().toISOString(),
        source
    };

    await insertToken(token);
    await logAudit({ tokenId, action: "MINT", actor: creator || "system", info: `Minted ${name} (${symbol})` });

    res.json(token);
});

app.get('/api/tokens', async (req, res) => {
    const tokens = await getAllTokens();
    res.json(tokens);
});

// --- Smart Contract Endpoints ---

const fs = require('fs');
const path = require('path');
let plutusBlueprint = null;

try {
    const blueprintPath = path.join(__dirname, 'contracts', 'plutus.json');
    if (fs.existsSync(blueprintPath)) {
        plutusBlueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
        logger.info("Loaded Plutus Blueprint", {
            contract: plutusBlueprint.preamble?.title,
            version: plutusBlueprint.preamble?.version
        });
    } else {
        logger.warn("plutus.json not found in contracts directory");
    }
} catch (err) {
    logger.error("Failed to load Plutus Blueprint", { error: err.message });
}

app.get('/api/contracts/blueprint', (req, res) => {
    if (!plutusBlueprint) {
        return res.status(404).json({ error: "Blueprint not loaded" });
    }
    res.json(plutusBlueprint);
});

// Explorer / Coins

app.get('/api/explorer', async (req, res) => {
    const { includeReal = 'true' } = req.query;

    // Get database tokens (simulated)
    const tokens = await getAllTokens();
    const dbTokens = await Promise.all(tokens.map(async (t) => {
        const votes = await getVote(t.tokenId);
        const reports = await getReports(t.tokenId);
        return {
            ...t,
            votes,
            reportCount: reports.length,
            isUnderReview: t.isDisputed || false,
            source: t.source || 'database'
        };
    }));

    // Get meme coins (simulated)
    const memeTokens = memeCoins.map(c => ({
        ...c,
        votes: { agree: 0, disagree: 0 },
        reportCount: 0,
        isUnderReview: false
    }));

    // Fetch real tokens from Blockfrost (with caching)
    let realTokens = [];
    if (includeReal === 'true' && process.env.BLOCKFROST_API_KEY) {
        const now = Date.now();
        if (now - lastRealFetch > CACHE_DURATION) {
            try {
                realTokens = await fetchLatestAssets(3);
                realTokensCache = realTokens;
                lastRealFetch = now;
                logger.info(`Fetched ${realTokens.length} real tokens from Blockfrost`);
                console.log(`[Blockfrost] Fetched ${realTokens.length} real tokens`);
            } catch (e) {
                logger.error('Blockfrost fetch failed', { error: e.message });
                realTokens = realTokensCache; // Use cached data
            }
        } else {
            realTokens = realTokensCache;
        }
    }

    // Mix real tokens at the top, then meme coins, then database tokens
    const allTokens = [
        ...realTokens.map(t => ({ ...t, tokenId: t.id, votes: { agree: 0, disagree: 0 }, reportCount: 0, isUnderReview: false })),
        ...memeTokens,
        ...dbTokens
    ];

    // Enrich all tokens with rug probability
    const enrichedTokens = allTokens.map(token => enrichWithRugProbability(token));

    res.json(enrichedTokens);
});

// --- Feature Endpoints ---

// === HYPE ANALYZER REQUIRE WITH ERROR HANDLING ===
console.log('[TRACE] About to require hypeAnalyzer module (line ~287)');
let hypeAnalyzer;
try {
    console.log('[TRACE] Requiring ./services/hypeAnalyzer...');
    hypeAnalyzer = require('./services/hypeAnalyzer');
    console.log('[DEBUG] ✅ Hype Analyzer required successfully');
} catch (err) {
    console.error('[FATAL] ❌ Failed requiring hypeAnalyzer:', err && err.stack ? err.stack : err);
    // Create a dummy to prevent further errors
    hypeAnalyzer = { getHypeRatio: async () => ({ error: 'Module failed to load' }) };
}

console.log('[DEBUG] Registering Hype Ratio endpoint...');

// Hype-to-Price Ratio endpoint
app.get('/api/tokens/:policyId/hype-ratio', async (req, res) => {
    console.log('[DEBUG] Hype ratio endpoint HIT for policyId:', req.params.policyId);
    try {
        const { policyId } = req.params;

        // Get token name (from your existing token data or default)
        const tokenName = req.query.name || 'Unknown Token';

        const result = await hypeAnalyzer.getHypeRatio(policyId, tokenName);

        res.json(result);

    } catch (error) {
        console.error('Hype ratio error:', error);
        res.status(500).json({
            error: 'Failed to calculate hype ratio',
            details: error.message
        });
    }
});

// === Policy X-Ray Endpoint ===
app.get('/api/xray/:policyId', async (req, res) => {
    const { policyId } = req.params;
    console.log(`[X-RAY] Starting scan for policy: ${policyId}`);

    try {
        // 1. Fetch On-Chain Data (Blockfrost)
        // We use fetchRealToken from blockfrostService which returns formatted data
        const onChainData = await fetchRealToken(policyId);

        if (!onChainData) {
            return res.status(404).json({ error: "Token policy not found on-chain" });
        }

        // 2. AI Risk Analysis (Masumi)
        // analyzeWithMasumi expects the data format returned by fetchRealToken
        const aiAnalysis = await analyzeWithMasumi(onChainData);

        // 3. Combine Results
        const result = {
            policyId,
            scanResult: onChainData,
            masumiExplanation: aiAnalysis.analysis.explanation,
            riskLevel: aiAnalysis.analysis.risk_level,
            timestamp: new Date().toISOString()
        };

        res.json(result);

    } catch (error) {
        console.error('[X-RAY] Scan failed:', error);
        res.status(500).json({
            error: "X-Ray scan failed",
            details: error.message
        });
    }
});

app.post('/api/publish/:tokenId', async (req, res) => {
    await logAudit({ tokenId: req.params.tokenId, action: "PUBLISH", actor: "system", info: "Analysis published" });
    res.json({ tokenId: req.params.tokenId, status: "published", analysisHash: "hash_" + Math.random().toString(16).slice(2) });
});

app.post('/api/report', async (req, res) => {
    const { tokenId, reportText, reporterId } = req.body;
    const id = tokenId || req.body.itemId;
    const text = reportText || req.body.reason + ": " + req.body.details;

    if (!id || !text) return res.status(400).json({ error: "Missing fields" });

    const token = await getToken(id);
    if (!token) return res.status(404).json({ error: "Token not found" });

    const analysisHash = "hash_" + Math.random().toString(16).slice(2);
    const txid = "tx_" + Math.random().toString(36).slice(2, 10);
    const log = { tokenId: id, analysisHash, txid, timestamp: new Date().toISOString() };

    await insertAuditLog({ ...log, action: "WHISTLEBLOWER_REPORT", actor: reporterId || 'anon', info: text });
    await insertReport({ tokenId: id, reporterId: reporterId || 'anon', text, timestamp: new Date().toISOString() });

    res.json({ success: true, reportId: txid, penalty: 0 });
});

// Enhanced ZK Whistleblower Endpoint
app.post('/api/whistle', async (req, res) => {
    const { tokenId, reportText, walletAddress } = req.body;

    if (!tokenId || !reportText) {
        return res.status(400).json({ error: 'Missing tokenId or reportText' });
    }

    const timestamp = Date.now();
    const crypto = require('crypto');

    // Simulate ZK proof generation (Midnight-style)
    const secret = crypto.randomBytes(32).toString('hex');
    const nullifier = crypto.createHash('sha256')
        .update(secret)
        .update(walletAddress || 'anonymous')
        .digest('hex');

    const commitment = crypto.createHash('sha256')
        .update(nullifier)
        .update(tokenId)
        .update(timestamp.toString())
        .digest('hex');

    const proofData = crypto.createHash('sha256')
        .update(commitment)
        .update(reportText)
        .digest('hex');

    const zkProof = {
        protocol: 'groth16-simulated',
        curve: 'bn128',
        commitment: commitment,
        nullifier: nullifier.slice(0, 32),
        proof: {
            pi_a: [proofData.slice(0, 32), proofData.slice(32, 64)],
            pi_b: [[proofData.slice(0, 16), proofData.slice(16, 32)],
            [proofData.slice(32, 48), proofData.slice(48, 64)]],
            pi_c: [proofData.slice(0, 32), proofData.slice(32, 64)]
        },
        publicSignals: [commitment.slice(0, 16)],
        verified: true,
        verifiedAt: new Date().toISOString()
    };

    // Create report
    const reportId = crypto.randomBytes(8).toString('hex');
    const report = {
        id: reportId,
        tokenId,
        reportText,
        zkProof,
        status: 'verified',
        createdAt: new Date().toISOString()
    };

    // Save to database
    try {
        await insertReport({ tokenId, reporterId: 'zk_anonymous', text: reportText });
    } catch (e) {
        logger.warn('Failed to save report to DB', { error: e.message });
    }

    // Log to audit
    await logAudit({
        tokenId,
        action: 'ZK_WHISTLEBLOWER_REPORT',
        actor: 'anonymous',
        info: `ZK-verified report. Commitment: ${commitment.slice(0, 16)}...`
    });

    // Update token risk in meme coins
    const token = memeCoins.find(c => c.id === tokenId);
    if (token) {
        token.reports_count = (token.reports_count || 0) + 1;
        token.trustScore = Math.max(0, token.trustScore - 3);
    }

    res.json({
        status: 'success',
        reportId,
        message: 'Report submitted with ZK proof verification',
        zkProof: {
            protocol: zkProof.protocol,
            commitment: zkProof.commitment,
            nullifier: zkProof.nullifier,
            verified: zkProof.verified,
            verifiedAt: zkProof.verifiedAt
        }
    });
});

app.post('/api/vote', async (req, res) => {
    const { tokenId, vote, voterId } = req.body;
    if (!tokenId || !['agree', 'disagree'].includes(vote)) {
        return res.status(400).json({ error: "Invalid vote data" });
    }

    // Log voter (for one vote per wallet tracking)
    if (voterId) {
        logger.info(`Vote recorded: ${vote} on ${tokenId} by ${voterId.slice(0, 12)}...`);
    }

    await updateVote(tokenId, vote);
    const votes = await getVote(tokenId);

    // Check for dispute logic
    const { agree, disagree } = votes;
    const token = await getToken(tokenId);

    if (token) {
        let newScore = token.trust_score;
        let isDisputed = token.isDisputed;

        if ((agree + disagree) >= 3 && disagree > agree) {
            isDisputed = true;
            newScore = Math.min(newScore, 40);
        } else {
            isDisputed = false;
        }

        if (newScore !== token.trust_score || isDisputed !== token.isDisputed) {
            await updateTokenTrust(tokenId, newScore, isDisputed);
        }
    }

    res.json({ success: true, votes });
});

app.post('/api/trade', async (req, res) => {
    const { tokenId, type, amount, trader } = req.body;
    if (!tokenId || !['buy', 'sell'].includes(type) || !amount) {
        return res.status(400).json({ error: "Invalid trade data" });
    }

    const token = await getToken(tokenId);
    if (!token) return res.status(404).json({ error: "Token not found" });

    const price = 1.0; // Simplified
    logger.info(`Trade Executed: ${type.toUpperCase()} ${amount} ${token.symbol} @ ${price} ADA by ${trader ? trader.slice(0, 12) + '...' : 'anonymous'}`);

    let newScore = token.trust_score;
    if (type === 'buy') {
        newScore = Math.min(100, newScore + 1);
    } else {
        newScore = Math.max(0, newScore - 1);
    }

    await updateTokenTrust(tokenId, newScore, token.isDisputed);

    // Log trade in audit trail
    await logAudit({
        tokenId,
        action: "TRADE",
        actor: trader || "anonymous",
        info: `${type.toUpperCase()} ${amount} ${token.symbol} @ ${price} ADA`
    });

    res.json({
        success: true,
        fill: {
            price,
            quantity: amount,
            txId: "tx_" + Math.random().toString(36).slice(2, 15)
        },
        newTrustScore: newScore
    });
});

app.get('/api/audits', async (req, res) => {
    try {
        const logs = await getAuditLogs(req.query.tokenId);
        res.json(logs);
    } catch (err) {
        logger.error("Failed to fetch audits", { error: err.message });
        res.status(500).json({ error: "Failed to fetch audits" });
    }
});

// Contract Info Endpoint
app.get('/api/contract/info', (req, res) => {
    if (!deploymentInfo) {
        return res.status(404).json({
            error: 'Contract not deployed',
            message: 'Run deployment script: node scripts/deploy.js'
        });
    }
    res.json(deploymentInfo);
});

// Alias for contract info
app.get('/api/contract', (req, res) => {
    res.redirect('/api/contract/info');
});

// Health Check with Blockfrost Status
app.get('/api/health', async (req, res) => {
    let blockfrostStatus = 'disconnected';
    let latestBlock = null;

    if (process.env.BLOCKFROST_API_KEY) {
        try {
            const healthy = await healthCheck();
            blockfrostStatus = healthy ? 'connected' : 'unhealthy';
        } catch (e) {
            blockfrostStatus = 'error: ' + e.message;
        }
    }

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            backend: 'running',
            database: 'connected',
            blockfrost: blockfrostStatus,
            memeFactory: factoryInterval ? 'running' : 'stopped',
            contract: deploymentInfo ? 'loaded' : 'not_deployed'
        },
        stats: {
            memeCoins: memeCoins.length,
            realTokensCache: realTokensCache.length
        }
    });
});

// Get Real Token from Blockfrost
app.get('/api/tokens/real/:assetId', async (req, res) => {
    if (!process.env.BLOCKFROST_API_KEY) {
        return res.status(503).json({ error: 'Blockfrost not configured' });
    }

    try {
        const tokenData = await fetchRealToken(req.params.assetId);

        if (!tokenData) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        res.json(tokenData);
    } catch (e) {
        logger.error('Blockfrost fetch error', { error: e.message });
        res.status(500).json({ error: e.message });
    }
});

// Get Latest Real Assets
app.get('/api/tokens/latest', async (req, res) => {
    if (!process.env.BLOCKFROST_API_KEY) {
        return res.status(503).json({ error: 'Blockfrost not configured' });
    }

    try {
        const limit = parseInt(req.query.limit) || 5;
        const assets = await fetchLatestAssets(Math.min(limit, 20));
        res.json(assets);
    } catch (e) {
        logger.error('Blockfrost fetch error', { error: e.message });
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/yaci/assets/:assetId', (req, res) => {
    const data = getAssetDetails(req.params.assetId);
    res.json(data);
});
app.get('/api/yaci/txs/:assetId', (req, res) => {
    const data = getAssetTxs(req.params.assetId);
    res.json(data);
});

// --- Meme Coin Factory Endpoints ---

app.get('/api/memecoins', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const coins = memeCoins.slice(0, limit);

    // Enrich with rug probability
    const enrichedCoins = coins.map(coin => enrichWithRugProbability(coin));

    res.json(enrichedCoins);
});

app.get('/api/memecoins/:id', (req, res) => {
    const coin = memeCoins.find(c => c.tokenId === req.params.id || c.id === req.params.id);
    if (!coin) {
        return res.status(404).json({ error: 'Meme coin not found' });
    }

    // Enrich with rug probability
    const enrichedCoin = enrichWithRugProbability(coin);

    res.json(enrichedCoin);
});


// Test endpoint for real Cardano data
app.get('/api/tokens/:policyId/data', async (req, res) => {
    const { policyId } = req.params;
    const { assetName = '' } = req.query;

    console.log(`[TEST] Fetching data for policy: ${policyId}`);

    try {
        const tokenData = await fetchRealTokenData(policyId, assetName);
        res.json({
            success: true,
            data: tokenData,
            summary: {
                policyId: tokenData.policyId,
                holderCount: tokenData.holderDistribution?.totalHolders || 0,
                top1HolderPct: tokenData.holderDistribution?.top1HolderPct || 0,
                txLast24h: tokenData.activityMetrics?.txLast24h || 0,
                errors: tokenData.errors.length,
                dataHash: tokenData.dataHash
            }
        });
    } catch (err) {
        console.error(`[TEST] Error:`, err.message);
        res.status(500).json({
            success: false,
            error: err.message,
            suggestion: 'Make sure the policy ID exists on Cardano Preprod testnet'
        });
    }
});

app.post('/api/memecoins/generate', (req, res) => {
    const newCoin = generateMemeCoin();
    memeCoins.unshift(newCoin);

    if (memeCoins.length > 100) {
        memeCoins = memeCoins.slice(0, 100);
    }

    logger.info(`Manually generated meme coin: ${newCoin.name}`);
    res.json(newCoin);
});

app.post('/api/memecoins/batch', (req, res) => {
    const count = Math.min(req.body.count || 5, 20); // Max 20 at once
    const batch = generateBatch(count);

    memeCoins = [...batch, ...memeCoins];

    if (memeCoins.length > 100) {
        memeCoins = memeCoins.slice(0, 100);
    }

    logger.info(`Generated batch of ${count} meme coins`);
    res.json(batch);
});

app.post('/api/memecoins/factory/start', (req, res) => {
    startMemeFactory();
    res.json({ status: 'started', message: 'Meme factory auto-generation started' });
});

app.post('/api/memecoins/factory/stop', (req, res) => {
    stopMemeFactory();
    res.json({ status: 'stopped', message: 'Meme factory auto-generation stopped' });
});

app.post('/api/generate-meme-identity', async (req, res) => {
    const { seed } = req.body;
    // Try to get existing identity
    // For this demo, we assume seed ~ address or we just generate new.
    // Ideally we'd use wallet address.

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const prompt = `Generate a funny crypto meme identity for seed: "${seed || ''}". Return JSON: { "username": "", "astrology": "", "traits": [{"label":"", "value":""}] }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const identity = JSON.parse(text);

        // Save if we had an address (mocking address as seed for now if it looks like one)
        if (seed && seed.startsWith('addr')) {
            await saveIdentity({ address: seed, ...identity });
        }

        res.json(identity);
    } catch (error) {
        logger.error("Gemini Error", { error: error.message });
        res.status(500).json({ username: "FallbackDoge", astrology: "AI is sleeping.", traits: [] });
    }
});

app.post('/api/masumi-chat', async (req, res) => {
    const { message, context } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        let enrichedContext = context || {};

        // Enrich context if tokenId is present
        if (context && context.tokenId) {
            const token = await getToken(context.tokenId);
            if (token) {
                const reports = await getReports(context.tokenId);
                const votes = await getVote(context.tokenId);
                const audits = await getAuditLogs(context.tokenId);

                enrichedContext = {
                    ...enrichedContext,
                    tokenDetails: token,
                    communityReports: reports,
                    communityVotes: votes,
                    auditHistory: audits
                };
            }
        }

        const chat = model.startChat({
            history: [{
                role: "user",
                parts: [{
                    text: `You are Masumi, an advanced crypto security analyst AI for the Cardano blockchain.
                Your goal is to protect users from scams and rug pulls.
                Analyze the provided context (token details, community reports, audit logs) critically.
                If there are reports or low trust scores, warn the user.
                Be concise, professional, but slightly witty.` }]
            }]
        });

        const result = await chat.sendMessage(message + (enrichedContext ? ` \n\n[System Context Data]: ${JSON.stringify(enrichedContext)}` : ""));
        res.json({ response: result.response.text() });
    } catch (error) {
        logger.error("Masumi Chat Error", { error: error.message });
        res.json({ response: "I'm currently offline or experiencing high traffic. Please check the manual audit logs for now." });
    }
});

const crypto = require('crypto');

/**
 * @typedef {Object} MasumiResponse
 * @property {string} explanation - Explanation of the risk assessment
 * @property {number} suggested_delta - Suggested trust score adjustment
 * @property {string} summary_for_hash - Summary string to be hashed
 * @property {string} decision_hash - Hash of the summary
 */

app.post('/risk/:policyId/ask-masumi', async (req, res) => {
    const { policyId } = req.params;
    const { assetName = '' } = req.body;

    console.log(`[API] Analyze request for policy: ${policyId}`);
    console.log(`[API] Request body:`, req.body);

    try {
        // Step 1: Fetch real on-chain data from Cardano
        console.log(`[API] Step 1: Fetching real Cardano data...`);
        const tokenData = await fetchRealTokenData(policyId, assetName);

        if (tokenData.errors.length > 0) {
            console.log(`[API] Warning: ${tokenData.errors.length} errors during data fetch`);
        }

        // Step 2: Send to Masumi AI for analysis
        console.log(`[API] Step 2: Sending to Masumi AI...`);
        const aiResult = await analyzeWithMasumi(tokenData);

        // Step 3: Build verifiable proof
        const timestamp = Date.now();
        const rugProbability = aiResult.analysis.rug_probability || 50;
        const summary = `policyId=${policyId}|rug=${rugProbability}|ts=${timestamp}`;
        const decision_hash = crypto.createHash('sha256').update(summary).digest('hex');

        console.log(`[API] ✓ Analysis complete. Rug probability: ${rugProbability}%`);

        // Persist analysis for retrieval
        await insertAuditLog({
            tokenId: policyId,
            action: 'MASUMI_ANALYSIS',
            actor: 'masumi_agent',
            info: aiResult.analysis.explanation || 'Analysis complete',
            analysisHash: decision_hash,
            timestamp: new Date().toISOString()
        });

        // Return comprehensive response
        res.json({
            // AI Analysis
            explanation: aiResult.analysis.explanation || 'Analysis complete',
            rug_probability: rugProbability,
            risk_level: aiResult.analysis.risk_level || 'unknown',
            suggested_action: aiResult.analysis.suggested_action || 'monitor',
            confidence: aiResult.analysis.confidence || 0.7,

            // Real Data Summary
            realData: {
                holderCount: tokenData.holderDistribution?.totalHolders || 0,
                top1HolderPct: tokenData.holderDistribution?.top1HolderPct || 0,
                txLast24h: tokenData.activityMetrics?.txLast24h || 0,
                canMintMore: tokenData.mintBurnSummary?.canMintMore || false,
                dataHash: tokenData.dataHash,
                fetchedAt: tokenData.fetchedAt,
                errors: tokenData.errors.length
            },

            // Verifiable Proof
            proof: {
                summary_for_hash: summary,
                decision_hash: decision_hash,
                timestamp: new Date(timestamp).toISOString()
            },

            // Metadata
            method: aiResult.fallback ? 'rule_based' : 'ai_powered',
            processingTime: Date.now() - timestamp
        });

    } catch (err) {
        console.error('[API] Analysis failed:', err.message);

        // Return error with helpful message
        res.status(500).json({
            error: 'Analysis failed',
            message: err.message,
            suggestion: 'Check if Blockfrost API key is valid and token exists on Cardano Preprod'
        });
    }
});

app.post('/risk/:policyId/publish', async (req, res) => {
    const { policyId } = req.params;
    const { risk_score, analysis_hash, wallet_address } = req.body;

    if (!plutusBlueprint) {
        return res.status(501).json({ error: 'Smart contract not configured' });
    }

    try {
        // Get script address from blueprint
        const validator = plutusBlueprint.validators.find(v => v.title === 'risk_registry.risk_registry');
        if (!validator) {
            return res.status(500).json({ error: 'Validator not found in blueprint' });
        }

        const scriptHash = validator.hash;
        const scriptAddress = `addr_test1wp${scriptHash.slice(0, 53)}`; // Simplified for demo

        // Build datum
        const datum = {
            policy_id: policyId,
            risk_score: risk_score,
            analysis_hash: analysis_hash,
            last_updated: Date.now()
        };

        res.json({
            status: 'ready_to_sign',
            script_address: scriptAddress,
            script_hash: scriptHash,
            datum: datum,
            message: 'Transaction ready. Sign with wallet to publish on-chain.'
        });

    } catch (err) {
        console.error('Publish error:', err);
        res.status(500).json({ error: 'Failed to build transaction' });
    }
});

app.get('/risk/:policyId/onchain', async (req, res) => {
    const { policyId } = req.params;
    const BLOCKFROST_KEY = process.env.BLOCKFROST_API_KEY;
    const axios = require('axios');

    if (!BLOCKFROST_KEY || !plutusBlueprint) {
        return res.json({ onchain: false, message: 'On-chain lookup not configured' });
    }

    try {
        const validator = plutusBlueprint.validators.find(v => v.title === 'risk_registry.risk_registry');
        const scriptHash = validator.hash;

        // Query UTxOs at script address via Blockfrost
        const response = await axios.get(
            `https://cardano-preprod.blockfrost.io/api/v0/scripts/${scriptHash}/utxos`,
            { headers: { project_id: BLOCKFROST_KEY } }
        );

        // Find UTxO for this policyId (simplified: check datum)
        const utxos = response.data || [];
        const match = utxos.find(u => {
            // In real impl: decode datum and check policy_id field
            return u.inline_datum && u.inline_datum.includes(policyId);
        });

        if (match) {
            res.json({
                onchain: true,
                tx_hash: match.tx_hash,
                datum: match.inline_datum,
                message: 'Risk data found on-chain'
            });
        } else {
            res.json({ onchain: false, message: 'Not yet published on-chain' });
        }

    } catch (err) {
        console.error('On-chain lookup error:', err.message);
        res.json({ onchain: false, message: 'Lookup failed' });
    }
});

app.use('/api', (req, res) => {
    res.status(404).json({ error: "API Endpoint not found" });
});

// Error Handling
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason });
});

// Keep-alive
setInterval(() => {
    // logger.info('Heartbeat');
}, 60000);

app.listen(5001, () => logger.info('Backend listening at http://localhost:5001'));
