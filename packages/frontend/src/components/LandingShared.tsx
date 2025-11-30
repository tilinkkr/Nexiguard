import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- STYLES & THEME DEFINITIONS ---
export const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Oxanium:wght@400;500;600;700&display=swap');

    :root {
      --color-void: #010402;
      --color-card-bg: #050806;
      --color-emerald-500: #10b981;
      --color-emerald-400: #34d399;
      --color-phosphor: #d1fae5;
      --color-purple-500: #8b5cf6;
      --color-blue-500: #3b82f6;
    }

    body {
      background-color: var(--color-void);
      color: var(--color-phosphor);
      font-family: 'JetBrains Mono', monospace;
      overflow-x: hidden;
      margin: 0;
    }

    /* TYPOGRAPHY */
    .font-brand {
      font-family: 'Oxanium', display;
    }
    
    /* CRT MONITOR EFFECTS */
    .scanline {
      width: 100%;
      height: 100px;
      z-index: 9999;
      background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(16, 185, 129, 0.04) 50%, rgba(0,0,0,0) 100%);
      opacity: 0.1;
      position: fixed;
      bottom: 100%;
      animation: scanline 8s linear infinite;
      pointer-events: none;
    }

    @keyframes scanline {
      0% { bottom: 100%; }
      100% { bottom: -100px; }
    }

    /* SPOTLIGHT CARD EFFECT */
    .hud-card {
      position: relative;
      background: rgba(5, 8, 6, 0.9);
      border: 1px solid rgba(16, 185, 129, 0.15);
      overflow: hidden;
    }

    .hud-card::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(
        800px circle at var(--mouse-x) var(--mouse-y), 
        rgba(16, 185, 129, 0.06),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 1;
      pointer-events: none;
    }

    .hud-card:hover::before {
      opacity: 1;
    }

    .hud-card::after {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(
        600px circle at var(--mouse-x) var(--mouse-y), 
        rgba(16, 185, 129, 0.3),
        transparent 40%
      );
      opacity: 0;
      z-index: 0;
      pointer-events: none;
    }
    
    .corner-accent {
      position: absolute;
      width: 10px; height: 10px;
      border-color: var(--color-emerald-500);
      border-style: solid;
      transition: all 0.3s ease;
      z-index: 2;
    }
    .tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
    .tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
    .bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
    .br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

    .hud-card:hover .corner-accent {
      width: 100%; height: 100%;
      border-color: rgba(16, 185, 129, 0.1);
    }

    .hud-card.privacy-mode .corner-accent { border-color: var(--color-purple-500); }

    /* GLITCH EFFECT */
    .glitch-text {
      position: relative;
    }
    .glitch-text::before,
    .glitch-text::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--color-void);
    }
    .glitch-text::before {
      left: 2px;
      text-shadow: -1px 0 #ff00c1;
      clip-path: inset(44% 0 61% 0);
      animation: glitch-anim 2s infinite linear alternate-reverse;
    }
    .glitch-text::after {
      left: -2px;
      text-shadow: -1px 0 #00fff9;
      clip-path: inset(58% 0 43% 0);
      animation: glitch-anim 2s infinite linear alternate-reverse;
      animation-delay: 1s;
    }

    @keyframes glitch-anim {
      0% { clip-path: inset(40% 0 61% 0); }
      20% { clip-path: inset(92% 0 1% 0); }
      40% { clip-path: inset(43% 0 1% 0); }
      60% { clip-path: inset(25% 0 58% 0); }
      80% { clip-path: inset(54% 0 7% 0); }
      100% { clip-path: inset(58% 0 43% 0); }
    }
    
    .typewriter {
      overflow: hidden;
      border-right: 2px solid #10b981;
      white-space: nowrap;
      animation: typing 3.5s steps(40, end), blink-caret .75s step-end infinite;
    }

    @keyframes typing { from { width: 0 } to { width: 100% } }
    @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: #10b981; } }

    .score-glow-red { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2), inset 0 0 10px rgba(239, 68, 68, 0.1); }
    .score-glow-green { box-shadow: 0 0 15px rgba(16, 185, 129, 0.2), inset 0 0 10px rgba(16, 185, 129, 0.1); }
    
    /* BACKGROUND EFFECTS */
    .cyber-grid {
      background-size: 50px 50px;
      background-image:
        linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
      mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 100%);
      pointer-events: none;
      position: fixed;
      inset: 0;
      z-index: 0;
    }
  `}</style>
);

// --- API LAYER ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const API = {
    login: async (creds: any) => {
        await delay(1500);
        return { success: true, user: { name: 'Neo', role: 'Operator' } };
    },
    register: async (data: any) => {
        await delay(1500);
        return { success: true, user: { name: data.username, role: 'Novice' } };
    },
    getTokens: async () => {
        await delay(800);
        return [
            { id: 'policy_1', symbol: 'SAFEX', name: 'SafeMoon2', price: 0.0001, risk: 'low', score: 85, flags: 0, timestamp: '2:01:30 pm', isLatest: true },
            { id: 'policy_2', symbol: 'CHAD', name: 'ChadToken', price: 0.04, risk: 'high', score: 40, flags: 2, timestamp: '2:00:17 pm', isLatest: false },
            { id: 'policy_3', symbol: 'DOGEX', name: 'DogeClone', price: 1.25, risk: 'high', score: 29, flags: 2, timestamp: '2:00:47 pm', isLatest: true },
            { id: 'policy_4', symbol: 'PEPE', name: 'PepeChain', price: 3200, risk: 'medium', score: 48, flags: 1, timestamp: '1:59:47 pm', isLatest: false },
        ];
    },
    getMemecoins: async () => {
        await delay(600);
        return [
            { id: 'meme_1', name: 'BonkBonk', trust: 85, trend: 'up' },
            { id: 'meme_2', name: 'RugPull', trust: 12, trend: 'down' },
            { id: 'meme_3', name: 'MoonShot', trust: 45, trend: 'flat' },
        ];
    },
    getTokenDetail: async (id: string) => {
        await delay(1000);
        return {
            id,
            name: id === 'policy_1' ? 'NexGuard' : 'Unknown Token',
            symbol: id === 'policy_1' ? 'NEX' : 'UNK',
            supply: '1,000,000,000',
            price: 1.25,
            trustScore: id === 'policy_1' ? 92 : 45,
            riskAnalysis: "Token contract verified. No honey-pot logic detected. Liquidity locked for 12 months. Owner wallet holds < 5% supply.",
            decisionHash: "0x8f2...a91b"
        };
    },
    mintToken: async (data: any) => {
        await delay(2000);
        return { success: true, policyId: `policy_${Math.floor(Math.random() * 10000)}`, txHash: "0x" + Math.random().toString(16).slice(2) };
    },
    askMasumi: async (id: string) => {
        await delay(2500);
        return {
            explanation: "Masumi AI Analysis: Pattern matches legitimate utility token distribution. Code similarity to verified projects is 98%. Low probability of rugpull based on current liquidity depth.",
            delta: "+5%"
        };
    },
    getAudits: async () => {
        await delay(500);
        return [
            { id: 1, time: '2 mins ago', action: 'MINT', user: 'User_99', status: 'success' },
            { id: 2, time: '15 mins ago', action: 'RISK_ANALYSIS', user: 'System', status: 'success' },
            { id: 3, time: '1 hour ago', action: 'TRADE', user: 'Whale_01', status: 'fail' },
            { id: 4, time: '2 hours ago', action: 'REPORT', user: 'Anon', status: 'success' },
        ];
    }
};

// --- VISUAL COMPONENTS ---

export const MatrixRain = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂ';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const rainDrops = Array.from({ length: columns }).fill(1) as number[];

        const draw = () => {
            ctx.fillStyle = 'rgba(1, 4, 2, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#10b981';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < rainDrops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        };

        const intervalId = setInterval(draw, 33);
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-20 pointer-events-none" />;
};

export const getCardanoDots = (centerX: number, centerY: number, scale: number) => {
    const dots: { x: number, y: number, r: number }[] = [];
    dots.push({ x: centerX, y: centerY, r: 12 * scale });
    const rings = [
        { count: 6, radius: 40 * scale, size: 8 * scale },
        { count: 6, radius: 70 * scale, size: 10 * scale, offset: Math.PI / 6 },
        { count: 6, radius: 100 * scale, size: 6 * scale }
    ];
    rings.forEach(ring => {
        for (let i = 0; i < ring.count; i++) {
            const angle = (i * 2 * Math.PI / ring.count) + (ring.offset || 0);
            dots.push({
                x: centerX + Math.cos(angle) * ring.radius,
                y: centerY + Math.sin(angle) * ring.radius,
                r: ring.size
            });
        }
    });
    return dots;
};

export const CardanoLogo = ({ className = "", size = 120, hidden = false, color = "#3b82f6" }: { className?: string, size?: number, hidden?: boolean, color?: string }) => {
    const dots = getCardanoDots(size / 2, size / 2, size / 250);
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={`transition-opacity duration-200 ${className}`}
            style={{ opacity: hidden ? 0 : 1 }}
        >
            {dots.map((dot, i) => (
                <circle
                    key={i}
                    cx={dot.x}
                    cy={dot.y}
                    r={dot.r}
                    fill={color}
                    className="animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s`, filter: `drop-shadow(0 0 2px ${color})` }}
                />
            ))}
        </svg>
    );
};

export const CoinRain = ({ falling }: { falling: boolean }) => {
    const coins = React.useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: Math.random() * 90 + 5,
        top: Math.random() * 80 + 10,
        size: 40 + Math.random() * 50,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 5,
        color: Math.random() > 0.5 ? '#10b981' : '#3b82f6'
    })), []);

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {coins.map((coin) => (
                <div
                    key={coin.id}
                    className={`absolute transition-all ease-in ${falling ? 'opacity-0' : 'opacity-60'}`}
                    style={{
                        left: `${coin.left}%`,
                        top: `${coin.top}%`,
                        transform: falling
                            ? `translateY(100vh) rotate(${Math.random() * 360}deg)`
                            : `translateY(0) rotate(0deg)`,
                        transitionDuration: falling ? `${0.5 + Math.random()}s` : '0s',
                        zIndex: 1
                    }}
                >
                    <div className="animate-spin" style={{ animationDuration: `${coin.duration}s` }}>
                        <div className="rounded-full border border-dashed flex items-center justify-center bg-black/40 backdrop-blur-md"
                            style={{
                                width: coin.size,
                                height: coin.size,
                                borderColor: coin.color,
                                boxShadow: `0 0 15px ${coin.color}40`
                            }}>
                            <CardanoLogo size={coin.size * 0.6} color={coin.color} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const ExplosionCanvas = ({ active, onComplete, size = 120 }: { active: boolean, onComplete: () => void, size?: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();

    useEffect(() => {
        if (!active || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const baseDots = getCardanoDots(size / 2, size / 2, size / 250);
        let particles: any[] = [];

        baseDots.forEach(dot => {
            const particleCount = 15;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: dot.x + (Math.random() - 0.5) * dot.r,
                    y: dot.y + (Math.random() - 0.5) * dot.r,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12,
                    life: 1.0,
                    decay: 0.01 + Math.random() * 0.03,
                    color: Math.random() > 0.5 ? '#3b82f6' : '#ffffff',
                    size: Math.random() * 2 + 1
                });
            }
        });

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let aliveParticles = 0;
            particles.forEach(p => {
                if (p.life > 0) {
                    aliveParticles++;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= 0.94;
                    p.vy *= 0.94;
                    p.life -= p.decay;
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            if (aliveParticles > 0) {
                requestRef.current = requestAnimationFrame(animate);
            } else {
                onComplete();
            }
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [active, onComplete, size]);

    if (!active) return null;
    return <canvas ref={canvasRef} width={size} height={size} className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-50" />;
};

// --- COMMON COMPONENTS ---

export const Card = ({ children, className = "", privacyMode = false }: { children: React.ReactNode, className?: string, privacyMode?: boolean }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className={`hud-card rounded-sm p-6 shadow-lg relative group ${privacyMode ? 'privacy-mode' : ''} ${className}`}
        >
            <div className="corner-accent tl"></div>
            <div className="corner-accent tr"></div>
            <div className="corner-accent bl"></div>
            <div className="corner-accent br"></div>
            <div className="relative z-10">{children}</div>
        </div>
    );
};

export const Badge = ({ type, text, icon: Icon }: { type: 'success' | 'warning' | 'danger' | 'neutral' | 'privacy' | 'latest', text: string, icon?: any }) => {
    const colors = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        danger: 'bg-red-500/10 text-red-400 border-red-500/30',
        neutral: 'bg-emerald-900/20 text-emerald-200/50 border-emerald-500/10',
        privacy: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        latest: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-brand font-bold tracking-wider uppercase border rounded-sm ${colors[type]}`}>
            {Icon && <Icon size={10} />}
            {text}
        </span>
    );
};

export const Button = ({ children, onClick, variant = 'primary', className = "", fullWidth = false, isLoading = false, type = "button" }: any) => {
    const baseStyle = "font-brand uppercase tracking-widest text-sm font-bold py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 clip-path-slant";
    const variants = {
        primary: "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
        secondary: "bg-transparent border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500",
        danger: "bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-500/20",
        success: "bg-emerald-900/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20",
        privacy: "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.4)]",
        ghost: "text-emerald-500/50 hover:text-emerald-400"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className} ${fullWidth ? 'w-full' : ''} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            disabled={isLoading}
        >
            {isLoading ? 'PROCESSING...' : children}
        </button>
    );
};
