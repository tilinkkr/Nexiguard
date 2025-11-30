import React from 'react';
import { Fingerprint, Wallet, Sparkles } from 'lucide-react';

export default function MemePassportCard() {
    return (
        <div className="bg-[#0a0614] border border-white/10 rounded-2xl p-6 h-full flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-colors duration-500"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                    <div className="absolute -top-2 -right-2">
                        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Fingerprint className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 font-heading">
                    Meme Passport
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed max-w-[240px] mb-8">
                    Connect your wallet to generate your unique <span className="text-cyan-400 font-bold">On-Chain Identity</span> and unlock exclusive features.
                </p>

                <button className="w-full max-w-[200px] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40">
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                </button>
            </div>
        </div>
    );
}
