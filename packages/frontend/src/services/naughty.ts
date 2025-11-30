import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// In a real app, this key should probably be proxied or handled more securely,
// but for this hackathon demo/local setup, we'll use the env var or hardcoded key.
const MASUMI_KEY = '90eaad934569f2dfc939938249e04febfaefc5ddd3eabff79b56c555a6e548f0e';

export interface NaughtyAnalysis {
    wallet: string;
    policy_id: string;
    classification: string;
    sass_score: number;
    evidence: any;
    decision_hash: string;
    onchain_tx: string | null;
    timestamp: string;
}

export const analyzeWallet = async (wallet: string, policyId: string): Promise<NaughtyAnalysis> => {
    const response = await axios.post(
        `${API_URL}/masumi/naughty/analyze`,
        {
            wallet,
            policy_id: policyId,
            force: true
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'X-MASUMI-KEY': MASUMI_KEY
            }
        }
    );
    return response.data;
};

export const getWalletAnalysis = async (wallet: string, policyId: string): Promise<NaughtyAnalysis | null> => {
    try {
        const response = await axios.get(`${API_URL}/masumi/naughty/${wallet}`, {
            params: { policy_id: policyId }
        });
        return response.data;
    } catch (error) {
        return null;
    }
};
