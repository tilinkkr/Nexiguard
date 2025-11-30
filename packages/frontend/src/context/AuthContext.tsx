import { createContext, useState, useEffect, type ReactNode } from 'react';
// @ts-ignore
import { fetchJSON } from '../lib/fetchJSON';

interface User {
    id: string;
    role: string;
    [key: string]: any;
}

interface Wallet {
    address: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    wallet: Wallet | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    login?: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null,
    wallet: null,
    connectWallet: async () => { },
    disconnectWallet: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('nexguard_token') || null);
    const [user, setUser] = useState<User | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);

    useEffect(() => {
        if (token) {
            // Validate token or fetch user profile if endpoint exists
            // For now, we assume token is valid if present
            setUser({ id: 'user_1', role: 'user' });
        }
    }, [token]);

    async function connectWallet() {
        if (!(window as any).cardano) {
            alert('CIP-30 wallet not found. Please install Nami, Eternl, or Flint.');
            return;
        }

        try {
            // Try Nami first, then others
            const cardano = (window as any).cardano;
            const provider = cardano.nami || cardano.eternl || cardano.flint;
            if (!provider) throw new Error("No supported wallet provider found");

            const api = await provider.enable();
            if (!api) throw new Error("Failed to enable wallet API");

            const addresses = await api.getUsedAddresses();
            if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
                throw new Error("No addresses found in wallet");
            }

            const address = addresses[0]; // In a real app, convert hex to bech32
            if (!address) throw new Error("Invalid wallet address");

            // Mock signature flow for hackathon (since we don't have a real wallet connected in this env often)
            const randomStr = Math.random().toString(36);
            const signature = "mock_sig_" + (randomStr ? randomStr.slice(2) : Date.now().toString());

            const resp = await fetchJSON('/auth/wallet', {
                method: 'POST',
                body: { address, signature }
            });

            if (!resp || !resp.token) {
                throw new Error("Invalid response from auth endpoint");
            }

            setToken(resp.token);
            localStorage.setItem('nexguard_token', resp.token);
            setWallet({ address });
            setUser(resp.user);

        } catch (err: any) {
            console.error("Wallet connection failed", err);
            alert("Failed to connect wallet: " + (err?.message || "Unknown error"));
        }
    }

    // Added login method for Cyberpunk Landing Page
    const login = async (email: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockToken = 'mock_token_' + Math.random().toString(36).substr(2);
        setToken(mockToken);
        localStorage.setItem('nexguard_token', mockToken);
        setUser({ id: 'user_' + email, role: 'operator', email });
    };

    function disconnectWallet() {
        setToken(null);
        localStorage.removeItem('nexguard_token');
        setWallet(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ token, user, wallet, connectWallet, disconnectWallet, login }}>
            {children}
        </AuthContext.Provider>
    );
}
