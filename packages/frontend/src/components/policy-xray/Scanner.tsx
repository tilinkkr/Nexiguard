import { useState } from 'react';
import { Hexagon, Activity, Search } from 'lucide-react';

interface ScannerProps {
    onScan: (id: string) => void;
    loading: boolean;
}

export default function Scanner({ onScan, loading }: ScannerProps) {
    const [input, setInput] = useState('');

    return (
        <div className="relative max-w-2xl mx-auto mb-12 group">
            {/* Hexagonal Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

            <div className="relative bg-[#0a0614] border border-cyan-500/30 rounded-xl p-1 flex items-center shadow-[0_0_30px_rgba(0,255,255,0.1)]">
                <div className="pl-4 text-cyan-500">
                    <Hexagon className="w-6 h-6 animate-pulse" />
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter Policy ID or Asset Name..."
                    className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-white placeholder:text-gray-600 font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && onScan(input)}
                />
                <button
                    onClick={() => onScan(input)}
                    disabled={!input || loading}
                    className="px-6 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold rounded-lg border border-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    SCAN
                </button>
            </div>

            {/* Quick Access */}
            <div className="flex justify-center gap-3 mt-4">
                {['HOSKY', 'SNEK', 'MIN'].map(token => (
                    <button
                        key={token}
                        onClick={() => { setInput(token); onScan(token); }}
                        className="text-[10px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors border border-white/5"
                    >
                        {token}
                    </button>
                ))}
            </div>
        </div>
    );
}
