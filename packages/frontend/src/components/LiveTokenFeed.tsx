import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { TrendingUp, AlertTriangle, Shield, Sparkles, Activity } from 'lucide-react';
import TokenAnalysisModal from './TokenAnalysisModal';

interface MemeCoin {
    id: string;
    tokenId?: string;
    name: string;
    symbol: string;
    trustScore: number;
    trust_score?: number;
    riskLevel: string;
    riskProfile?: string;
    flags: string[];
    createdAt: string;
    created_at?: string;
    priceChange24h?: string | number;
    rugProbability?: {
        percentage: number;
        label: string;
        emoji: string;
        color: string;
        severity: string;
    };
}

interface LiveTokenFeedProps {
    onTokenClick?: (policyId: string) => void;
}

export default function LiveTokenFeed({ onTokenClick }: LiveTokenFeedProps) {
    const [coins, setCoins] = useState<MemeCoin[]>([]);
    const [newCoinAlert, setNewCoinAlert] = useState<MemeCoin | null>(null);
    const [selectedToken, setSelectedToken] = useState<MemeCoin | null>(null);

    useEffect(() => {
        const isDemo = window.location.search.includes('demo=true');

        if (isDemo) {
            runDemoScenario();
        } else {
            fetchCoins();
            const interval = setInterval(fetchCoins, 5000);
            return () => clearInterval(interval);
        }
    }, []);

    const runDemoScenario = () => {
        console.log('🚀 Starting Demo Scenario...');

        const initialCoins: MemeCoin[] = [
            { id: 'demo-1', name: 'SafeMoon 3.0', symbol: 'SAFE3', trustScore: 88, riskLevel: 'safe', priceChange24h: 15.2, flags: [], createdAt: new Date().toISOString() },
            { id: 'demo-2', name: 'PepeAI', symbol: 'PEPEAI', trustScore: 65, riskLevel: 'medium', priceChange24h: 5.4, flags: [], createdAt: new Date(Date.now() - 100000).toISOString() },
            { id: 'demo-3', name: 'ElonMuskCat', symbol: 'ELONCAT', trustScore: 42, riskLevel: 'risky', priceChange24h: -12.5, flags: ['Low Liquidity'], createdAt: new Date(Date.now() - 200000).toISOString() },
        ];
        setCoins(initialCoins);

        const events = [
            {
                delay: 3000,
                action: () => {
                    const newCoin: MemeCoin = {
                        id: 'demo-attack', name: 'SuperGem', symbol: 'GEM',
                        trustScore: 95, riskLevel: 'safe', priceChange24h: 0, flags: [],
                        createdAt: new Date().toISOString()
                    };
                    setNewCoinAlert(newCoin);
                    setCoins(prev => [newCoin, ...prev]);
                    setTimeout(() => setNewCoinAlert(null), 5000);
                }
            },
            {
                delay: 8000,
                action: () => {
                    setCoins(prev => prev.map(c =>
                        c.id === 'demo-attack' ? { ...c, priceChange24h: 50.5, trustScore: 92 } : c
                    ));
                }
            },
            {
                delay: 12000,
                action: () => {
                    setCoins(prev => prev.map(c =>
                        c.id === 'demo-attack' ? {
                            ...c,
                            priceChange24h: -40.2,
                            trustScore: 30,
                            riskLevel: 'risky',
                            flags: ['Whale Dump Detected']
                        } : c
                    ));
                }
            },
            {
                delay: 16000,
                action: () => {
                    setCoins(prev => prev.map(c =>
                        c.id === 'demo-attack' ? {
                            ...c,
                            priceChange24h: -99.9,
                            trustScore: 5,
                            riskLevel: 'scam',
                            flags: ['Whale Dump Detected', 'Liquidity Removed'],
                            rugProbability: { percentage: 99, label: 'RUG PULL', emoji: '💀', color: 'red', severity: 'critical' }
                        } : c
                    ));
                }
            }
        ];

        events.forEach(event => setTimeout(event.action, event.delay));
    };

    const fetchCoins = async () => {
        try {
            console.log('Fetching coins from:', `${API_URL}/memecoins?limit=20`);
            const res = await axios.get(`${API_URL}/memecoins?limit=20`);
            console.log('Coins fetched:', res.data);
            const newCoins = res.data;

            if (coins.length > 0 && newCoins.length > 0) {
                const latestCoin = newCoins[0];
                const latestId = latestCoin.id || latestCoin.tokenId;
                const isNew = !coins.some(c => (c.id || c.tokenId) === latestId);

                if (isNew) {
                    setNewCoinAlert(latestCoin);
                    setTimeout(() => setNewCoinAlert(null), 5000);
                }
            }

            setCoins(newCoins);
        } catch (err) {
            console.error('Failed to fetch meme coins:', err);
        }
    };

    const getTrustColor = (score: number) => {
        if (score >= 75) return 'from-green-500 to-emerald-600';
        if (score >= 50) return 'from-yellow-500 to-amber-600';
        if (score >= 25) return 'from-orange-500 to-red-600';
        return 'from-red-600 to-rose-700';
    };

    const getTrustBorderColor = (score: number) => {
        if (score >= 75) return 'border-green-500/50 shadow-green-500/20';
        if (score >= 50) return 'border-yellow-500/50 shadow-yellow-500/20';
        if (score >= 25) return 'border-orange-500/50 shadow-orange-500/20';
        return 'border-red-500/50 shadow-red-500/20';
    };

    return (
        <div className="h-full rounded-3xl bg-[#050510] border border-white/10 p-4 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    Live Threat Feed
                </h2>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-mono text-green-400">LIVE</span>
                </div>
            </div>

            {/* New Coin Alert */}
            {newCoinAlert && (
                <div className="mb-4 relative overflow-hidden rounded-xl shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
                    <div className="relative p-3 border border-blue-500/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                                    <Sparkles className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-bounce"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-blue-400 font-bold text-xs mb-0.5">🎉 New Token!</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-white text-sm font-bold truncate">{newCoinAlert.name}</p>
                                    <p className="text-gray-400 text-xs">({newCoinAlert.symbol})</p>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-lg border font-bold text-sm shadow-lg bg-gradient-to-r ${getTrustColor((newCoinAlert.trustScore ?? newCoinAlert.trust_score) ?? 0)} ${getTrustBorderColor((newCoinAlert.trustScore ?? newCoinAlert.trust_score) ?? 0)}`}>
                                <div className="text-white drop-shadow-lg">
                                    {(newCoinAlert.trustScore ?? newCoinAlert.trust_score) ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Token List */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent space-y-2 min-h-0">
                {coins.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-12 h-12 mx-auto mb-3 bg-white/5 rounded-full flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-gray-600 animate-pulse" />
                        </div>
                        <p className="text-gray-500 text-sm">Scanning mempool...</p>
                    </div>
                ) : (
                    coins.map((coin, index) => {
                        const trustScore = (coin.trustScore ?? coin.trust_score) ?? 0;
                        const priceChange = parseFloat(String(coin.priceChange24h || 0));

                        return (
                            <button
                                key={coin.id || coin.tokenId || index}
                                onClick={() => {
                                    setSelectedToken(coin);
                                    if (onTokenClick) onTokenClick(coin.id || coin.tokenId || '');
                                }}
                                className={`w-full text-left rounded-xl border px-3 py-2 flex items-center justify-between transition-all duration-200 group
                                    ${trustScore < 50
                                        ? 'bg-red-500/5 hover:bg-red-500/15 border-red-500/30'
                                        : trustScore > 70
                                            ? 'bg-green-500/5 hover:bg-green-500/15 border-green-500/30'
                                            : 'bg-yellow-500/5 hover:bg-yellow-500/15 border-yellow-500/30'
                                    }`}
                            >
                                <div>
                                    <div className={`text-xs font-medium flex items-center gap-2 ${trustScore < 50 ? 'text-red-200' : trustScore > 70 ? 'text-green-200' : 'text-yellow-200'
                                        }`}>
                                        {coin.symbol}
                                        <span className="text-[10px] opacity-70">• {trustScore}% Trust</span>
                                    </div>
                                    <div className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[120px]">
                                        {coin.name}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-[10px] font-bold ${priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {priceChange > 0 ? '+' : ''}{priceChange}%
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        Just now
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Analysis Modal */}
            {selectedToken && (
                <TokenAnalysisModal
                    token={selectedToken}
                    onClose={() => setSelectedToken(null)}
                />
            )}
        </div>
    );
}
