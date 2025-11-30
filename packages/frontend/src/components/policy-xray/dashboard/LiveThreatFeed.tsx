import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

const MOCK_THREATS = [
    { id: 1, name: 'WojakProtocol', symbol: 'WOJAX', trust: 86, change: 4.11, time: 'Just now' },
    { id: 2, name: 'RocketPepe', symbol: 'ROCK', trust: 51, change: -1.8, time: 'Just now' },
    { id: 3, name: 'ApeSafe', symbol: 'APESX', trust: 17, change: -16.79, time: 'Just now' },
    { id: 4, name: 'MiniWojak', symbol: 'MINI', trust: 46, change: 15.11, time: 'Just now' },
    { id: 5, name: 'SafeMoon2', symbol: 'SFM2', trust: 92, change: 2.5, time: '1m ago' },
];

export default function LiveThreatFeed() {
    const [threats, setThreats] = useState(MOCK_THREATS);

    // Simulate live feed updates
    useEffect(() => {
        const interval = setInterval(() => {
            setThreats(prev => {
                const newThreat = { ...prev[Math.floor(Math.random() * prev.length)] };
                newThreat.id = Date.now();
                newThreat.change = Number((Math.random() * 20 - 10).toFixed(2));
                newThreat.time = 'Just now';
                return [newThreat, ...prev.slice(0, 4)];
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#0a0614] border border-white/10 rounded-2xl p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" /> Live Threat Feed
                </h3>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 tracking-wider">LIVE</span>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative space-y-2">
                {threats.map((threat) => (
                    <div key={threat.id} className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-right fade-in duration-500">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${threat.trust > 80 ? 'text-emerald-400' : threat.trust > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {threat.symbol}
                                </span>
                                <span className="text-[10px] text-gray-500">• {threat.trust}% Trust</span>
                            </div>
                            <div className="text-[10px] text-gray-400">{threat.name}</div>
                        </div>
                        <div className="text-right">
                            <div className={`text-xs font-bold ${threat.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {threat.change >= 0 ? '+' : ''}{threat.change}%
                            </div>
                            <div className="text-[10px] text-gray-600">{threat.time}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
