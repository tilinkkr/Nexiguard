import { useState } from 'react';
import { Search, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_TOKENS = [
    { id: 'wojak', name: 'WojakProtocol', symbol: 'WOJAX', score: 86, risk: 'LOW' },
    { id: 'rocket', name: 'RocketPepe', symbol: 'ROCK', score: 51, risk: 'MEDIUM' },
    { id: 'ape', name: 'ApeSafe', symbol: 'APESX', score: 17, risk: 'CRITICAL' },
    { id: 'mini', name: 'MiniWojak', symbol: 'MINI', score: 46, risk: 'MEDIUM' },
];

export default function TokenExplorer() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const filteredTokens = MOCK_TOKENS.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-[#0a0614] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-heading">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-400"></div>
                        </div>
                        Token Explorer
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Real-time AI risk analysis & market intelligence</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">32</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-white">12</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-white">
                            <span className="font-bold text-yellow-400">APESX</span>: High Risk Detected
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search tokens by name or symbol..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                </div>
                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-xs font-bold text-white">All</button>
                    <button className="px-4 py-2 rounded-lg hover:bg-white/5 text-xs font-bold text-gray-400 transition-colors">Safe</button>
                    <button className="px-4 py-2 rounded-lg hover:bg-white/5 text-xs font-bold text-gray-400 transition-colors">Risky</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredTokens.map(token => (
                    <div
                        key={token.id}
                        onClick={() => navigate(`/app/policy-xray/${token.id}`)}
                        className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{token.name}</h3>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${token.score > 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                token.score > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                {token.score}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{token.symbol}</span>
                            <span className={`${token.risk === 'LOW' ? 'text-emerald-400' :
                                token.risk === 'MEDIUM' ? 'text-yellow-400' :
                                    'text-red-400'
                                } font-bold`}>
                                {token.risk} RISK
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
