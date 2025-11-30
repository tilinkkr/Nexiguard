import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Code, Brain, Fingerprint, Database, EyeOff, Gamepad2, Server, Layers, HelpCircle, MessageSquare } from 'lucide-react';
import { GlobalStyles, MatrixRain, Button, Card } from '../components/LandingShared';
import ConnectWalletButton from '../components/ConnectWalletButton';

export default function Landing() {
    const navigate = useNavigate();

    const history = [
        { title: "Phase 1: Foundation", desc: "Trust Score concept & Monorepo setup.", icon: Code },
        { title: "Phase 2: Core Dev", desc: "Masumi AI integration & Risk Registry contracts.", icon: Brain },
        { title: "Phase 3: Polish", desc: "Glassmorphism UI & Meme Passport gamification.", icon: Fingerprint },
        { title: "Phase 4: Integration", desc: "Full mainnet support & database persistence.", icon: Database },
    ];

    const features = [
        { title: "AI Risk Analysis", desc: "Ask Masumi anything about token safety using natural language.", icon: Brain },
        { title: "Trust Score", desc: "Dynamic 0-100 score based on liquidity & community votes.", icon: ShieldAlert },
        { title: "Whistleblower", desc: "Anonymous scam reporting via ZK-proofs.", icon: EyeOff },
        { title: "Simulator", desc: "Practice trading in a safe, sandboxed environment.", icon: Gamepad2 },
    ];

    const faqs = [
        { q: "What is NexGuard?", a: "NexGuard is a Web3 security platform on Cardano that uses AI to analyze token risks and prevent scams." },
        { q: "How is the Trust Score calculated?", a: "It aggregates on-chain data (liquidity, distribution) and off-chain community sentiment into a single 0-100 score." },
        { q: "Is the whistleblower reporting anonymous?", a: "Yes. We use Zero-Knowledge (ZK) proofs to verify your report eligibility without ever revealing your wallet address." },
        { q: "Do I need real funds for the simulator?", a: "No. The Trading Simulator uses a sandbox environment with test tokens, so you can practice risk-free." },
    ];

    return (
        <div className="min-h-screen bg-[#010402] text-white font-mono selection:bg-emerald-500/30 overflow-x-hidden relative">
            <GlobalStyles />
            <div className="scanline"></div>
            <div className="cyber-grid fixed inset-0 z-0"></div>
            <MatrixRain />

            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-[#010402]/80 backdrop-blur-md border-b border-emerald-500/20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-brand font-bold text-xl tracking-tighter text-white">
                        <ShieldAlert className="text-emerald-500" />
                        <span className="glitch-text" data-text="NEXGUARD">NEXGUARD</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link to="/app">
                            <Button variant="secondary" className="text-xs py-2 px-4 hidden md:flex">OPEN APP</Button>
                        </Link>
                        <ConnectWalletButton />
                        <Link to="/login">
                            <Button variant="secondary" className="text-xs py-2 px-4">LOGIN</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary" className="text-xs py-2 px-4">GET STARTED</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <header className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-widest uppercase animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    System Online v2.0
                </div>
                <h1 className="text-5xl md:text-7xl font-brand font-bold mb-6 leading-tight">
                    SECURE YOUR <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 glitch-text" data-text="DEFI JOURNEY">DEFI JOURNEY</span>
                </h1>
                <p className="text-slate-400 max-w-2xl text-lg mb-10 leading-relaxed">
                    NexGuard combines AI-driven risk analysis, community reporting, and simulated environments to protect you from crypto scams on Cardano.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Button variant="primary" onClick={() => navigate('/app')} className="text-lg px-8 py-4">
                        LAUNCH APP
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/docs')} className="text-lg px-8 py-4">
                        READ DOCS
                    </Button>
                </div>
            </header>

            {/* Executive Summary */}
            <section className="py-20 px-6 bg-black/40 relative z-10 border-y border-emerald-500/10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-brand font-bold mb-6 text-white">EXECUTIVE SUMMARY</h2>
                    <p className="text-slate-400 leading-relaxed text-lg">
                        NexGuard is a comprehensive Web3 Security Platform designed to protect users from DeFi scams. It addresses the critical problem of "rug pulls" by providing tools to verify token safety before investing, leveraging Google Gemini AI and Zero-Knowledge proofs for whistleblower protection.
                    </p>
                </div>
            </section>

            {/* History */}
            <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
                <h2 className="text-3xl font-brand font-bold mb-12 text-center text-emerald-400">PROJECT EVOLUTION</h2>
                <div className="grid md:grid-cols-4 gap-6">
                    {history.map((phase, i) => (
                        <Card key={i} className="bg-black/60 backdrop-blur-sm border-emerald-500/20">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                                <phase.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 font-brand text-white">{phase.title}</h3>
                            <p className="text-sm text-slate-400">{phase.desc}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-emerald-900/5 border-y border-emerald-500/10 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-brand font-bold mb-12 text-center text-white">CORE FEATURES</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feat, i) => (
                            <Card key={i} className="hover:border-emerald-500/50 transition-colors bg-black/80">
                                <feat.icon size={32} className="text-emerald-500 mb-4" />
                                <h3 className="text-lg font-bold mb-2 font-brand text-white">{feat.title}</h3>
                                <p className="text-sm text-slate-400">{feat.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-20 px-6 max-w-7xl mx-auto relative z-10 text-center">
                <h2 className="text-3xl font-brand font-bold mb-12 text-emerald-400">POWERED BY</h2>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 text-blue-400"><Code size={32} /></div>
                        <span className="font-bold text-sm">React 18</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 text-green-400"><Server size={32} /></div>
                        <span className="font-bold text-sm">Node.js</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/30 text-yellow-400"><Brain size={32} /></div>
                        <span className="font-bold text-sm">Gemini AI</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-600/30 text-blue-500"><Layers size={32} /></div>
                        <span className="font-bold text-sm">Cardano</span>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 bg-black/40 relative z-10 border-t border-emerald-500/10">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-brand font-bold mb-12 text-center text-white flex items-center justify-center gap-2">
                        <HelpCircle className="text-emerald-500" /> FREQUENTLY ASKED QUESTIONS
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <Card key={i} className="hover:border-emerald-500/40 transition-colors bg-black/60">
                                <div className="flex gap-4">
                                    <div className="mt-1 text-emerald-500"><MessageSquare size={20} /></div>
                                    <div>
                                        <h3 className="text-lg font-bold font-brand text-white mb-2">{faq.q}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-slate-600 text-xs font-mono border-t border-emerald-500/10 bg-black relative z-10">
                <p>&copy; 2025 NEXGUARD SECURITY PLATFORM. ALL RIGHTS RESERVED.</p>
            </footer>
        </div>
    );
}
