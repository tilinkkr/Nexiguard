import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldAlert, Skull, FileText, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { analyzeWallet } from '../services/naughty';
import type { NaughtyAnalysis } from '../services/naughty';

export default function MasumiNaughty() {
    const [wallet, setWallet] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<NaughtyAnalysis | null>(null);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!wallet) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await analyzeWallet(wallet, '000policy'); // Default policy for wallet focus
            setResult(data);
        } catch (err) {
            setError('Failed to analyze wallet. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060608] text-white pt-24 pb-20 px-6 font-sans selection:bg-neon selection:text-black">

            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono mb-6"
                >
                    <Skull className="w-3 h-3" />
                    <span>AI-POWERED WALLET FORENSICS</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-heading font-bold mb-6 tracking-tight"
                >
                    MASUMI <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">NAUGHTY LIST</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
                >
                    Detect "Goblin Mode" whales and "Paper Hands" plebs with AI-driven behavioral analysis.
                    Anchored immutably on Cardano.
                </motion.p>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto mb-20 relative z-10">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center bg-[#0a0a0c] border border-white/10 rounded-2xl p-2 shadow-2xl">
                        <Search className="w-6 h-6 text-gray-500 ml-4" />
                        <input
                            type="text"
                            placeholder="Enter Wallet Address (addr...)"
                            value={wallet}
                            onChange={(e) => setWallet(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            className="w-full bg-transparent border-none focus:ring-0 text-lg px-4 py-3 text-white placeholder-gray-600 font-mono"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'ANALYZING...' : 'ANALYZE'}
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>

            {/* Results Section */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {/* Classification Card */}
                        <div className="md:col-span-1 bg-[#0a0a0c] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                <span className="text-5xl">
                                    {result.classification.includes('Goblin') ? '👹' : '📄'}
                                </span>
                            </div>

                            <h3 className="text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">CLASSIFICATION</h3>
                            <h2 className="text-3xl font-bold text-white mb-4">{result.classification}</h2>

                            <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
                                <div
                                    className={`h-full ${result.sass_score > 50 ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${result.sass_score}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between w-full text-xs text-gray-500 font-mono">
                                <span>SASS SCORE</span>
                                <span>{result.sass_score}/100</span>
                            </div>
                        </div>

                        {/* Evidence Locker */}
                        <div className="md:col-span-2 bg-[#0a0a0c] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold">Evidence Locker</h3>
                                </div>
                                <div className="text-xs font-mono text-gray-500">
                                    ID: {result.decision_hash.slice(0, 8)}...
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <StatBox label="TX Count" value={result.evidence.tx_count} icon={<ActivityIcon />} />
                                <StatBox label="Favorite Asset" value={result.evidence.favorite_asset} icon={<StarIcon />} />
                                <StatBox label="Suspicious Mints" value={result.evidence.suspicious_mints} icon={<AlertIcon />} isWarning={result.evidence.suspicious_mints > 0} />
                            </div>

                            {/* Blockchain Anchor */}
                            <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className="w-4 h-4 text-green-400" />
                                    <h4 className="font-mono text-sm text-green-400 uppercase tracking-wider">Blockchain Anchor</h4>
                                </div>

                                <div className="space-y-3 font-mono text-xs">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-500">Decision Hash</span>
                                        <span className="text-gray-300 truncate max-w-[200px] md:max-w-md" title={result.decision_hash}>
                                            {result.decision_hash}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-500">Status</span>
                                        <div className="flex items-center gap-2">
                                            {result.onchain_tx === 'SIMULATED' ? (
                                                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-[10px] border border-yellow-500/20">
                                                    SIMULATED COMMIT
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] border border-green-500/20">
                                                    ON-CHAIN
                                                </span>
                                            )}
                                            <CheckCircle className="w-3 h-3 text-gray-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatBox({ label, value, icon, isWarning = false }: any) {
    return (
        <div className={`p-4 rounded-xl border ${isWarning ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase font-mono">{label}</span>
                {icon}
            </div>
            <div className={`text-2xl font-bold ${isWarning ? 'text-red-400' : 'text-white'}`}>
                {value}
            </div>
        </div>
    );
}

const ActivityIcon = () => <ShieldAlert className="w-4 h-4 text-gray-600" />;
const StarIcon = () => <CheckCircle className="w-4 h-4 text-gray-600" />;
const AlertIcon = () => <AlertTriangle className="w-4 h-4 text-red-500" />;
