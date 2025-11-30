import { Link } from 'react-router-dom';
import ConnectWalletButton from './ConnectWalletButton';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function TopBar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-glass-outline bg-amlogo/80 backdrop-blur-md h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 bg-neon/20 rounded-full blur-md group-hover:blur-lg transition-all duration-500"></div>
                        <ShieldCheck className="w-6 h-6 text-neon relative z-10" />
                    </div>
                    <span className="text-xl font-heading font-bold tracking-wider text-white">
                        NEXGUARD<span className="text-neon">1</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    <NavLink to="/app" label="Explorer" />
                    <NavLink to="/app/mint" label="Mint" />
                    <NavLink to="/app/trade" label="Trade" />
                    <NavLink to="/app/passport" label="Passport" />
                    <NavLink to="/app/audits" label="Audits" />
                    <NavLink to="/app/policy-xray" label="X-Ray" />
                    <NavLink to="/app/naughty" label="Naughty List" />
                    <NavLink to="/mpm-lab" label="MPM Lab" />
                </nav>
            </div>

            <div className="flex items-center gap-4">
                {/* System Status Strip */}
                <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full bg-surface border border-glass-outline text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-neon" />
                        <span>TPS: 1,240</span>
                    </div>
                    <div className="w-px h-3 bg-glass-outline"></div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-electric" />
                        <span>LATENCY: 12ms</span>
                    </div>
                </div>

                <ConnectWalletButton />
            </div>
        </header>
    );
}

function NavLink({ to, label }: { to: string, label: string }) {
    return (
        <Link to={to} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-surface transition-all duration-200">
            {label}
        </Link>
    );
}
