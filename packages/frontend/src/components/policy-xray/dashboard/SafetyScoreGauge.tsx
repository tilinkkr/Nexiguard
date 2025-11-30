
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function SafetyScoreGauge() {
    const score = 57;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    return (
        <div className="bg-[#0a0614] border border-white/10 rounded-2xl p-6 h-full flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-yellow-500/5 blur-3xl group-hover:bg-yellow-500/10 transition-colors duration-500"></div>

            <div className="relative z-10">
                <svg className="w-48 h-48 transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="none"
                        className="text-white/5"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-yellow-500 font-heading tracking-tighter drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                        {score}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] mt-2 uppercase">
                        Safety Score
                    </span>
                </div>
            </div>

            <div className="flex gap-4 mt-8 w-full max-w-[200px]">
                <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-400 flex items-center justify-center gap-2 transition-colors">
                    <ShieldCheck className="w-3 h-3" /> AUDITS
                </button>
                <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-red-400 flex items-center justify-center gap-2 transition-colors">
                    <AlertTriangle className="w-3 h-3" /> SCAMS
                </button>
            </div>
        </div>
    );
}
