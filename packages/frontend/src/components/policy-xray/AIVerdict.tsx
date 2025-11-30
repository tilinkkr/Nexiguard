import React from 'react';
import { Zap, AlertTriangle, Layers, Download } from 'lucide-react';

interface AIVerdictProps {
    verdict: any;
    fullData?: any; // Optional full data for export
}

const AIVerdict = React.memo(({ verdict, fullData }: AIVerdictProps) => {

    const handleExport = () => {
        if (!fullData) return;

        const dataStr = JSON.stringify(fullData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `policy-xray-report-${fullData.policyId || 'unknown'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <Zap className="w-24 h-24 text-purple-500" />
            </div>

            <div className="relative z-10">
                <h3 className="text-sm font-bold text-purple-300 mb-4 flex items-center gap-2">
                    🤖 MASUMI AI VERDICT
                </h3>

                <div className="flex gap-6">
                    <div className="flex-1">
                        <p className="text-lg text-gray-200 leading-relaxed font-light">
                            "{verdict.summary}"
                        </p>

                        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="text-xs font-bold text-red-400 uppercase mb-1 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Critical Finding
                            </div>
                            <p className="text-sm text-red-200">
                                {verdict.criticalFinding}
                            </p>
                        </div>
                    </div>

                    <div className="w-64 border-l border-white/10 pl-6 flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-2">CONFIDENCE</div>
                        <div className="w-full bg-black/40 h-2 rounded-full mb-1">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${verdict.confidence}%` }}></div>
                        </div>
                        <div className="text-right text-xs font-bold text-purple-400">{verdict.confidence}%</div>

                        <div className="mt-6 text-xs text-gray-500 mb-2">ANALYSIS DEPTH</div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" /> DEEP SCAN
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={!fullData}
                            className="mt-6 w-full py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-colors border border-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-3 h-3" />
                            EXPORT REPORT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AIVerdict;
