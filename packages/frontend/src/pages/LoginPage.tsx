import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, ArrowRight } from 'lucide-react';
import {
    GlobalStyles,
    Card,
    Button,
    CardanoLogo,
    CoinRain,
    ExplosionCanvas,
    API
} from '../components/LandingShared';

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [exploding, setExploding] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setExploding(true);
    };

    const handleExplosionComplete = async () => {
        await API.login({ email, password });
        setLoading(false);
        navigate('/app');
    };

    return (
        <div className="min-h-screen bg-[#010402] flex items-center justify-center p-4 relative overflow-hidden">
            <GlobalStyles />
            <div className="scanline"></div>
            <div className="cyber-grid" style={{ zIndex: 0 }}></div>
            <CoinRain falling={exploding} />

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8 relative">
                    <div className="relative h-32 w-32 mx-auto mb-4">
                        <CardanoLogo size={128} hidden={exploding} color="#10b981" />
                        <ExplosionCanvas active={exploding} onComplete={handleExplosionComplete} size={128} />
                    </div>
                    <div className="flex items-center justify-center gap-3 font-brand font-bold text-4xl tracking-tighter text-white mb-2" data-text="NEXGUARD">
                        <ShieldAlert className="text-emerald-500" size={36} />
                        <span className="glitch-text text-emerald-50" data-text="NEXGUARD">NEXGUARD</span>
                    </div>
                    <p className="text-emerald-500/50 font-mono text-sm tracking-widest">SECURE ACCESS TERMINAL_v2.0</p>
                </div>

                <Card className="border-t-4 border-t-emerald-500 backdrop-blur-md bg-black/80">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest font-brand">Operator ID</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#010402] border border-emerald-500/20 rounded-none py-2.5 pl-10 pr-4 text-emerald-50 focus:border-emerald-500 focus:outline-none transition-all font-mono relative z-20"
                                    placeholder="operator@nexguard.io"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest font-brand">Passcode</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#010402] border border-emerald-500/20 rounded-none py-2.5 pl-10 pr-4 text-emerald-50 focus:border-emerald-500 focus:outline-none transition-all font-mono relative z-20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="primary" fullWidth isLoading={loading} className="group mt-6">
                            <span className="group-hover:mr-2 transition-all">AUTHENTICATE</span>
                            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-all absolute right-4" />
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
