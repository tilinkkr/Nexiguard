import React, { useState, useEffect } from "react";
import {
    Search,
    Activity,
    TrendingUp,
    AlertTriangle,
    Share2,
    Flag,
    Bookmark,
    HelpCircle,
    Zap,
    MessageCircle,
    Video
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// --- Components ---

function Header() {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050510]/80 backdrop-blur-xl px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xl">
                    🧪
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-wide text-white flex items-center gap-2">
                        MPM Lab
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            BETA
                        </span>
                    </h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                        Memes-Per-Minute Intelligence
                    </p>
                </div>
            </div>
            <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
            </button>
        </header>
    );
}

function HeroCard() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Explainer */}
            <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/10 p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-700"></div>

                <h2 className="text-2xl font-bold text-white mb-4 relative z-10">
                    What is MPM?
                </h2>
                <div className="space-y-3 text-gray-300 relative z-10 max-w-xl">
                    <p className="flex items-start gap-3">
                        <span className="mt-1 text-cyan-400">📈</span>
                        <span>
                            <strong className="text-white">Social Velocity Tracking:</strong> We monitor meme density across X, Telegram, and TikTok in real-time.
                        </span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="mt-1 text-yellow-400">⚡</span>
                        <span>
                            <strong className="text-white">Early Signal Detection:</strong> Spikes in MPM often precede price action by 5-15 minutes.
                        </span>
                    </p>
                    <p className="flex items-start gap-3">
                        <span className="mt-1 text-pink-400">🚨</span>
                        <span>
                            <strong className="text-white">"Memes are Monetary Policy":</strong> High MPM with low liquidity is a major volatility signal.
                        </span>
                    </p>
                </div>
            </div>

            {/* Global Stats */}
            <div className="rounded-3xl bg-[#0a0a15] border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5"></div>
                <div className="relative z-10">
                    <h3 className="text-sm font-mono text-cyan-400 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> GLOBAL PULSE
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Avg MPM (24h)</div>
                            <div className="text-2xl font-bold text-white flex items-end gap-2">
                                42.3 <span className="text-sm text-emerald-400 font-medium mb-1">+12%</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Hottest Token</div>
                            <div className="text-xl font-bold text-white flex items-center gap-2">
                                $DOGE <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300">180 MPM</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-500 flex justify-between">
                    <span>Tokens Tracked: 1,247</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live</span>
                </div>
            </div>
        </div>
    );
}

function AnalysisResult({ data }: { data: any }) {
    if (!data) return null;

    const sentimentColor =
        data.sentiment === "BULLISH" ? "emerald" :
            data.sentiment === "PANIC" ? "red" : "yellow";

    const SentimentIcon =
        data.sentiment === "BULLISH" ? TrendingUp :
            data.sentiment === "PANIC" ? AlertTriangle : Activity;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Dashboard Card */}
            <div className="rounded-3xl bg-[#0a0a15] border-2 border-cyan-500/30 shadow-[0_0_60px_rgba(0,255,255,0.1)] p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {/* Column 1: MPM Score */}
                    <div className="flex flex-col justify-center">
                        <div className="text-sm text-gray-400 mb-2 font-mono">MEMES PER MINUTE</div>
                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 tracking-tighter">
                            {data.mpm.toFixed(1)}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                Sample: {data.sample_size}
                            </span>
                            <span>Window: {data.window_min}m</span>
                        </div>
                    </div>

                    {/* Column 2: Sentiment */}
                    <div className="flex flex-col justify-center items-center md:items-start border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                        <div className="text-sm text-gray-400 mb-3 font-mono">SENTIMENT</div>
                        <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 bg-${sentimentColor}-500/10 border-${sentimentColor}-500/30 text-${sentimentColor}-400`}>
                            <SentimentIcon className="w-6 h-6" />
                            <span className="text-xl font-bold tracking-wide">{data.sentiment}</span>
                        </div>
                        <div className={`mt-4 text-xs font-bold text-${sentimentColor}-500/80 uppercase tracking-widest`}>
                            RISK LEVEL: {data.sentiment === "PANIC" ? "CRITICAL" : data.sentiment === "BULLISH" ? "HIGH VOLATILITY" : "MODERATE"}
                        </div>
                    </div>

                    {/* Column 3: Trend (Mock Sparkline) */}
                    <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                        <div className="text-sm text-gray-400 mb-2 font-mono flex justify-between">
                            <span>5-MIN TREND</span>
                            <span className="text-cyan-400">Peak: {(data.mpm * 1.2).toFixed(0)}</span>
                        </div>
                        <div className="h-24 w-full bg-white/5 rounded-xl border border-white/5 relative overflow-hidden flex items-end px-2 pb-2 gap-1">
                            {/* Mock bars */}
                            {[40, 60, 45, 70, 90, 65, 80, 100].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-cyan-500/20 rounded-sm hover:bg-cyan-500/40 transition-colors"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {data.breakdown && data.breakdown.map((platform: any, i: number) => (
                    <div key={i} className="rounded-2xl bg-[#0a0a15] border border-white/10 p-5 flex flex-col gap-3 hover:border-white/20 transition-colors group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-300 group-hover:text-white transition-colors">
                                {platform.platform === 'x' ? <span className="text-lg">𝕏</span> :
                                    platform.platform === 'telegram' ? <MessageCircle className="w-5 h-5 text-cyan-400" /> :
                                        <Video className="w-5 h-5 text-pink-500" />}
                                <span className="capitalize font-medium">{platform.platform === 'x' ? 'Twitter/X' : platform.platform}</span>
                            </div>
                            <div className="text-xs text-gray-500">{platform.window_min}m window</div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-bold text-white">{platform.count}</div>
                            <div className="text-xs font-mono text-gray-400">MENTIONS</div>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${platform.platform === 'x' ? 'bg-blue-500' :
                                        platform.platform === 'telegram' ? 'bg-cyan-500' : 'bg-pink-500'
                                    }`}
                                style={{ width: `${Math.min((platform.count / data.sampleSize) * 100 * 2, 100)}%` }} // Mock percentage
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Insights */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border border-purple-500/20 p-6 mb-8 relative">
                <div className="absolute top-4 right-4 text-purple-400/50">
                    <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-purple-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                    🤖 Masumi Analyst
                </h3>
                <p className="text-gray-300 leading-relaxed font-light text-lg">
                    "This token shows <strong className="text-white">significant coordinated activity</strong>.
                    The MPM spike suggests organized community mobilization.
                    <span className="block mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                        Warning: High velocity with low liquidity often precedes volatility. Exercise caution.
                    </span>
                </p>
                <div className="mt-4 text-[10px] text-purple-400/60 font-mono text-right">
                    Generated via Gemini 1.5 Pro • {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-all flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4" /> View Full Analysis
                </button>
                <button className="py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-sm font-medium text-red-400 transition-all flex items-center justify-center gap-2">
                    <Flag className="w-4 h-4" /> Report Token
                </button>
                <button className="py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-sm font-medium text-blue-400 transition-all flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" /> Share Report
                </button>
                <button className="py-3 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-sm font-medium text-yellow-400 transition-all flex items-center justify-center gap-2">
                    <Bookmark className="w-4 h-4" /> Watchlist
                </button>
            </div>
        </div>
    );
}

export default function MPMLab() {
    const [policyId, setPolicyId] = useState("");
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Recent searches (mock)
    const recentSearches = ["$WIF", "$BONK", "a0e5..."];

    async function handleRefresh() {
        if (!policyId) return;
        setLoading(true);
        setError(null);
        try {
            // 1. Refresh analysis
            await fetch(`${API_BASE}/api/mpm/${encodeURIComponent(policyId)}/refresh`, {
                method: "POST",
            });
            // 2. Fetch updated record
            const res = await fetch(`${API_BASE}/api/mpm/${encodeURIComponent(policyId)}`);
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            setData(json);
        } catch (e: any) {
            setError("Failed to analyze token. Please check the Policy ID.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#050510] text-white font-sans selection:bg-cyan-500/30">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-12">
                <HeroCard />

                {/* Input Section */}
                <div className="max-w-3xl mx-auto mb-16">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative flex bg-[#0a0a15] rounded-2xl border border-white/10 p-2 shadow-2xl">
                            <input
                                className="flex-1 bg-transparent border-none outline-none px-4 text-lg placeholder:text-gray-600 text-white"
                                placeholder="Enter Policy ID or Token Symbol..."
                                value={policyId}
                                onChange={(e) => setPolicyId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRefresh()}
                            />
                            <button
                                onClick={handleRefresh}
                                disabled={!policyId || loading}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Analyze
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Recent Searches */}
                    <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-500">
                        <span>Recent:</span>
                        {recentSearches.map((s) => (
                            <button key={s} className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-xs">
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Results */}
                <AnalysisResult data={data} />
            </main>
        </div>
    );
}
