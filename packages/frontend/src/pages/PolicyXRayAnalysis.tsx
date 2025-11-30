import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, AlertTriangle, CheckCircle, Activity, Zap, Lock, Database, Brain } from 'lucide-react';
import API_URL from '../apiConfig';

export default function PolicyXRayAnalysis() {
    const { id } = useParams();
    const [policyId, setPolicyId] = useState(id || '');
    const [loading, setLoading] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const [masumiExplanation, setMasumiExplanation] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            setPolicyId(id);
            handleScan(id);
        }
    }, [id]);

    const handleScan = async (pid: string = policyId) => {
        if (!pid) return;
        setLoading(true);
        setScanResult(null);
        setMasumiExplanation('');
        setError('');

        try {
            const response = await fetch(`${API_URL}/xray/${pid}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Scan failed');
            }

            setScanResult(data.scanResult);
            setMasumiExplanation(data.masumiExplanation);
        } catch (err: any) {
            console.error("Scan failed:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-white p-6 pt-24 relative overflow-hidden">
            {/* Background Grid & Glow */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,27,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,27,0.8)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full z-0"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-sm font-mono mb-4"
                    >
                        <Activity className="w-4 h-4" />
                        <span>NEXGUARD HOLOGRAPHIC LAB</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                        POLICY X-RAY
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Deep-dive analysis of Cardano minting policies using on-chain data and AI-powered risk assessment.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#0a0a16] border border-white/10 rounded-xl p-2 shadow-2xl">
                            <Search className="w-6 h-6 text-gray-400 ml-3" />
                            <input
                                type="text"
                                placeholder="Enter Policy ID (e.g., 1f2d3...)"
                                className="w-full bg-transparent border-none text-white px-4 py-3 focus:outline-none font-mono text-sm"
                                value={policyId}
                                onChange={(e) => setPolicyId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleScan(policyId)}
                            />
                            <button
                                onClick={() => handleScan(policyId)}
                                disabled={loading || !policyId}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Zap className="w-4 h-4 animate-pulse" />
                                        SCANNING...
                                    </>
                                ) : (
                                    <>
                                        SCAN
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3"
                        >
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </motion.div>
                    )}
                </div>

                {/* Results Area */}
                <AnimatePresence>
                    {scanResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left Column: On-Chain Data */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-[#0a0a16]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Database className="w-24 h-24 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Database className="w-5 h-5 text-cyan-400" />
                                        ON-CHAIN DATA
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                            <p className="text-xs text-gray-500 mb-1">Token Name</p>
                                            <p className="text-xl font-bold text-white">{scanResult.name}</p>
                                            <p className="text-xs font-mono text-gray-400">{scanResult.symbol}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                <p className="text-xs text-gray-500 mb-1">Holders</p>
                                                <p className="text-2xl font-bold text-white">{scanResult.holders}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                <p className="text-xs text-gray-500 mb-1">Supply</p>
                                                <p className="text-lg font-bold text-white truncate" title={scanResult.quantity}>
                                                    {parseInt(scanResult.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-xs text-gray-500">Whale Dominance</p>
                                                <p className={`text-xl font-bold ${scanResult.whalePercent > 50 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {scanResult.whalePercent}%
                                                </p>
                                            </div>
                                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${scanResult.whalePercent > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                                    style={{ width: `${scanResult.whalePercent}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Top holder ownership percentage</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#0a0a16]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-purple-400" />
                                        TRUST SCORE
                                    </h3>
                                    <div className="flex items-center justify-center py-4">
                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="64" cy="64" r="60" stroke="#1f2937" strokeWidth="8" fill="transparent" />
                                                <circle
                                                    cx="64"
                                                    cy="64"
                                                    r="60"
                                                    stroke={scanResult.trustScore > 70 ? '#10b981' : scanResult.trustScore > 40 ? '#f59e0b' : '#ef4444'}
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    strokeDasharray={377}
                                                    strokeDashoffset={377 - (377 * scanResult.trustScore) / 100}
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute text-center">
                                                <span className="text-3xl font-bold text-white">{scanResult.trustScore}</span>
                                                <span className="block text-xs text-gray-400">/ 100</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Masumi AI Analysis */}
                            <div className="lg:col-span-2">
                                <div className="h-full bg-[#0a0a16]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Brain className="w-64 h-64 text-purple-500" />
                                    </div>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                                            <Brain className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">MASUMI AI ANALYSIS</h3>
                                            <p className="text-purple-300 text-sm">Autonomous Risk Assessment Agent</p>
                                        </div>
                                    </div>

                                    {masumiExplanation ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="prose prose-invert max-w-none"
                                        >
                                            <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6 mb-6">
                                                <p className="text-lg leading-relaxed text-gray-200 whitespace-pre-line font-light">
                                                    {masumiExplanation}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
                                                    <Lock className="w-5 h-5 text-blue-400 mt-1" />
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">Minting Authority</h4>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {scanResult.metadata?.type === 'sig'
                                                                ? 'Controlled by single signature (Centralized)'
                                                                : 'Complex script detected'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
                                                    <Shield className="w-5 h-5 text-green-400 mt-1" />
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">Verification Status</h4>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            Policy ID matches on-chain records.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                            <Brain className="w-12 h-12 mb-4 animate-pulse opacity-50" />
                                            <p>Analyzing policy structure...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
