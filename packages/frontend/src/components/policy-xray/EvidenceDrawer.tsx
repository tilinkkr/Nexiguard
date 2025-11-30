import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy } from 'lucide-react';

const EvidenceDrawer = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-t border-white/10 bg-[#05030a]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-3 flex items-center justify-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors"
            >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                BLOCKCHAIN EVIDENCE (RAW DATA)
            </button>

            {isOpen && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                    <div>
                        <div className="text-xs font-bold text-gray-400 mb-2 flex justify-between">
                            <span>POLICY SCRIPT (CBOR)</span>
                            <button className="text-cyan-400 hover:text-cyan-300"><Copy className="w-3 h-3" /></button>
                        </div>
                        <div className="bg-black/40 rounded-lg p-3 font-mono text-[10px] text-gray-500 break-all border border-white/5">
                            82015820abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 mb-2">METADATA (JSON)</div>
                        <div className="bg-black/40 rounded-lg p-3 font-mono text-[10px] text-green-500/80 border border-white/5">
                            {`{
  "721": {
    "3297...": {
      "HOSKY": {
        "name": "HOSKY Token",
        "image": "ipfs://Qm..."
      }
    }
  }
}`}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default EvidenceDrawer;
