const axios = require('axios');

const API_URL = 'http://localhost:8000';
const KEY = '90eaad934569f2dfc939938249e04febfaefc5ddd3eabff79b56c555a6e548f0e';

async function testNaughty() {
    console.log('🧪 Testing Masumi Naughty Backend...');

    try {
        // 1. Analyze
        console.log('\n1. Calling /analyze...');
        const analyzeRes = await axios.post(
            `${API_URL}/masumi/naughty/analyze`,
            {
                wallet: 'addr_test1abc',
                policy_id: '000policy',
                force: true
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-MASUMI-KEY': KEY
                }
            }
        );
        console.log('✅ Analyze Success!');
        console.log('Response:', JSON.stringify(analyzeRes.data, null, 2));

        if (!analyzeRes.data.decision_hash) throw new Error('Missing decision_hash');
        if (analyzeRes.data.onchain_tx !== 'SIMULATED') throw new Error('onchain_tx should be SIMULATED');

        // 2. Get
        console.log('\n2. Calling GET /{wallet}...');
        const getRes = await axios.get(
            `${API_URL}/masumi/naughty/addr_test1abc?policy_id=000policy`
        );
        console.log('✅ Get Success!');
        console.log('Response:', JSON.stringify(getRes.data, null, 2));

        if (getRes.data.decision_hash !== analyzeRes.data.decision_hash) throw new Error('Hash mismatch');

        console.log('\n🎉 All Masumi Naughty tests passed!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received. Is the server running?');
        }
        process.exit(1);
    }
}

testNaughty();
