import React, { useState } from 'react';
import { AlertTriangle, Activity, CheckCircle, Search, ChevronUp, ChevronDown, XCircle, Database, ExternalLink } from 'lucide-react';

interface ReportCardProps {
    data: any;
}

const ReportCard = React.memo(({ data }: ReportCardProps) => {
    const [expandedSection, setExpandedSection] = useState<string | null>('findings');

    const toggle = (section: string) => setExpandedSection(expandedSection === section ? null : section);

    const riskColor = data.riskScore > 60 ? 'red' : data.riskScore > 30 ? 'yellow' : 'emerald';
    const RiskIcon = data.riskScore > 60 ? AlertTriangle : data.riskScore > 30 ? Activity : CheckCircle;

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Header / Score */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${riskColor}-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>

                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <div className="text-xs text-gray-400 font-mono mb-1">RISK SCORE</div>
                        <div className={`text-5xl font-black text-${riskColor}-400 flex items-center gap-3`}>
                            {data.riskScore}
                            <span className="text-sm font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300">
                                / 100
                            </span>
                        </div>
                        <div className={`text-sm font-bold text-${riskColor}-500 mt-2 flex items-center gap-2`}>
                            <RiskIcon className="w-4 h-4" />
                            {data.riskScore > 60 ? 'CRITICAL RISK' : data.riskScore > 30 ? 'MODERATE RISK' : 'LOW RISK'}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">POLICY TYPE</div>
                        <div className="font-mono text-cyan-400">Plutus V2</div>
                        <div className="text-[10px] text-gray-600 mt-1">{data.policyId.slice(0, 12)}...</div>
                    </div>
                </div>

                <div className="w-full bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden">
                    <div className={`h-full bg-${riskColor}-500 rounded-full`} style={{ width: `${data.riskScore}%` }}></div>
                </div>
            </div>

            {/* Collapsible Sections */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {/* Key Findings */}
                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <button
                        onClick={() => toggle('findings')}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                        <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
                            <Search className="w-4 h-4 text-cyan-400" /> Key Findings
                        </span>
                        {expandedSection === 'findings' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>

                    {expandedSection === 'findings' && (
                        <div className="px-4 pb-4 space-y-2">
                            {data.findings.map((finding: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 text-sm p-2 rounded bg-black/20">
                                    {finding.type === 'good' ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" /> :
                                        finding.type === 'bad' ? <XCircle className="w-4 h-4 text-red-500 mt-0.5" /> :
                                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                                    <span className="text-gray-300">{finding.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Metadata Integrity */}
                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <button
                        onClick={() => toggle('metadata')}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                        <span className="text-sm font-bold text-gray-200 flex items-center gap-2">
                            <Database className="w-4 h-4 text-purple-400" /> Metadata Integrity
                        </span>
                        {expandedSection === 'metadata' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>

                    {expandedSection === 'metadata' && (
                        <div className="px-4 pb-4 space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Standard</span>
                                <span className="text-white font-mono">CIP-25</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">IPFS Hash</span>
                                <span className="text-cyan-400 font-mono text-xs cursor-pointer hover:underline">QmX7...9j2 <ExternalLink className="w-3 h-3 inline" /></span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Image Status</span>
                                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Accessible</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ReportCard;
