import { useEffect } from 'react';
import { useRugProbability } from '../../hooks/useRugProbability';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Lock, Users, AlertTriangle, ArrowRight } from 'lucide-react';

interface RugMeterProps {
    policyId: string;
}

export function RugMeter({ policyId }: RugMeterProps) {
    const { data, loading, error } = useRugProbability(policyId);

    const handleTradeClick = () => {
        // Placeholder for trade logic
        console.log("Trade clicked for policy:", policyId);
    };

    if (loading) return (
        <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/5 rounded animate-pulse w-32" />
                            <div className="h-3 bg-white/5 rounded animate-pulse w-24" />
                        </div>
                    </div>
                    <div className="h-8 w-20 bg-white/5 rounded-full animate-pulse" />
                </div>
                <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full border-8 border-white/5 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl border border-red-500/20">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm">Failed to load risk analysis</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const getRiskColor = () => {
        switch (data.status) {
            case 'low': return { bg: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' };
            case 'medium': return { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' };
            case 'high': return { bg: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' };
            default: return { bg: 'from-gray-500/20 to-slate-500/20', border: 'border-gray-500/30', text: 'text-gray-400', glow: 'shadow-gray-500/20' };
        }
    };

    const colors = getRiskColor();
    const riskPercentage = data.score;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
        >
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-50`} />

            {/* Content */}
            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border backdrop-blur-sm`}>
                            <Shield className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Rug Risk Analysis</h3>
                            <p className="text-xs text-gray-400">On-chain & Social Metrics</p>
                        </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full ${colors.bg} ${colors.border} border backdrop-blur-sm`}>
                        <span className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>
                            {data.status}
                        </span>
                    </div>
                </div>

                {/* Score Circle */}
                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        {/* Background Circle */}
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-white/5"
                            />
                            {/* Progress Circle */}
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 56}`}
                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - riskPercentage / 100)}`}
                                className={colors.text}
                                strokeLinecap="round"
                            />
                        </svg>
                        {/* Score Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold ${colors.text}`}>{data.score}</span>
                            <span className="text-xs text-gray-400">/ 100</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-400">Top Holder</span>
                        </div>
                        <div className="text-sm font-bold text-white">{data.metrics.ownerConcentration}</div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Lock className={`w-3.5 h-3.5 ${data.metrics.liquidityLocked ? 'text-green-400' : 'text-red-400'}`} />
                            <span className="text-xs text-gray-400">Liquidity</span>
                        </div>
                        <div className={`text-sm font-bold ${data.metrics.liquidityLocked ? 'text-green-400' : 'text-red-400'}`}>
                            {data.metrics.liquidityLocked ? 'Locked' : 'Unlocked'}
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-400">Mints (24h)</span>
                        </div>
                        <div className="text-sm font-bold text-white">{data.metrics.recentActivity.mints.toLocaleString()}</div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-400">Social Spike</span>
                        </div>
                        <div className="text-sm font-bold text-white">{data.social.spikeScore}</div>
                    </div>
                </div>

                {/* Risk Factors */}
                {data.factors.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 mb-4">
                        <div className="text-xs font-semibold text-gray-300 mb-2">Key Factors:</div>
                        <div className="space-y-1">
                            {data.factors.slice(0, 3).map((factor, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <div className={`w-1 h-1 rounded-full ${colors.text} mt-1.5 flex-shrink-0`} />
                                    <span className="text-xs text-gray-400 leading-relaxed">{factor}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trade Anyway Button */}
                <motion.button
                    onClick={handleTradeClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2 group"
                >
                    <span>Trade Anyway</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        Updated {new Date(data.timestamp).toLocaleTimeString()}
                    </span>
                    {data.cached && (
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">Cached</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
