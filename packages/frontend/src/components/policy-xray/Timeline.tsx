import React from 'react';
import { Clock } from 'lucide-react';

interface TimelineProps {
    events: any[];
}

const Timeline = React.memo(({ events }: TimelineProps) => {
    return (
        <div className="rounded-2xl bg-[#0a0614] border border-white/10 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" /> TRANSACTION TIMELINE
                </h3>
                <button className="text-xs text-gray-500 hover:text-white transition-colors">Filter ▼</button>
            </div>

            <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2"></div>
                <div className="flex justify-between relative z-10 px-4">
                    {events.map((event, i) => (
                        <div key={i} className="flex flex-col items-center group cursor-pointer">
                            <div className={`w-3 h-3 rounded-full border-2 border-[#0a0614] ${event.type === 'danger' ? 'bg-red-500' : event.type === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'
                                } group-hover:scale-125 transition-transform`}></div>
                            <div className="mt-4 text-center opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="text-[10px] font-mono text-gray-400">{event.date}</div>
                                <div className="text-xs font-bold text-white">{event.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default Timeline;
