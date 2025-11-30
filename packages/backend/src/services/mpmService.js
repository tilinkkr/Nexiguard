const { insertMPM, getMPM: getMPMFromDB } = require('./db');

/**
 * Get MPM record for a policy ID
 * @param {string} policyId 
 * @returns {Promise<object|null>}
 */
async function getMPM(policyId) {
    return await getMPMFromDB(policyId);
}

/**
 * Trigger Masumi agent to fetch + recalc MPM
 * @param {string} policyId 
 * @param {string} tokenSymbol 
 * @returns {Promise<object>}
 */
async function refreshMPM(policyId, tokenSymbol = 'UNKNOWN') {
    // In a real implementation, this would call the Masumi Agent
    // For now, we simulate the analysis

    const mpmValue = Math.floor(Math.random() * 100); // 0-100 memes per minute
    const sentiment = mpmValue > 80 ? "PANIC" : mpmValue > 40 ? "BULLISH" : "NEUTRAL";

    const record = {
        policyId,
        tokenSymbol,
        windowMinutes: 5,
        mpm: mpmValue,
        sentiment,
        sampleSize: Math.floor(Math.random() * 1000) + 50,
        lastUpdated: new Date().toISOString()
    };

    await insertMPM(record);
    return record;
}

module.exports = {
    getMPM,
    refreshMPM
};
