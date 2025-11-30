import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, User, UserPlus } from 'lucide-react';
import {
    GlobalStyles,
    Card,
    Button,
    CardanoLogo,
    CoinRain,
    ExplosionCanvas,
    API
} from '../components/LandingShared';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [exploding, setExploding] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setExploding(true);
    };

    const handleExplosionComplete = async () => {
        await API.register(formData);
        setLoading(false);
        navigate('/app');
    };

    return (
        <div className="min-h-screen bg-[#010402] flex items-center justify-center p-4 relative overflow-hidden">
            <GlobalStyles />
            <div className="scanline"></div>
            <div className="cyber-grid" style={{ zIndex: 0 }}></div>
            <CoinRain falling={exploding} />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="text-center mb-8 relative">
                    <div className="relative h-32 w-32 mx-auto mb-4">
                        <CardanoLogo size={128} hidden={exploding} color="#3b82f6" />
                        <ExplosionCanvas active={exploding} onComplete={handleExplosionComplete} size={128} />
                    </div>
                    <h1 className="text-3xl font-brand font-bold text-white mb-2 tracking-widest">INITIALIZE</h1>
                    <p className="text-emerald-500/50 font-mono text-xs">JOIN THE DECENTRALIZED GRID</p>
                </div>

                <Card className="border-t-4 border-t-emerald-500 backdrop-blur-md bg-black/80">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest font-brand">Username</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full bg-[#010402] border border-emerald-500/20 rounded-none py-2.5 pl-10 pr-4 text-emerald-50 focus:border-emerald-500 focus:outline-none transition-all font-mono relative z-20"
                                    placeholder="Degen_001"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest font-brand">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#010402] border border-emerald-500/20 rounded-none py-2.5 pl-10 pr-4 text-emerald-50 focus:border-emerald-500 focus:outline-none transition-all font-mono relative z-20"
                                    placeholder="you@domain.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest font-brand">Passcode</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-[#010402] border border-emerald-500/20 rounded-none py-2.5 pl-10 pr-4 text-emerald-50 focus:border-emerald-500 focus:outline-none transition-all font-mono relative z-20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button type="submit" variant="primary" fullWidth isLoading={loading}>
                                <UserPlus size={18} /> CREATE IDENTITY
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
