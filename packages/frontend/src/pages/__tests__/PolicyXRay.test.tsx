import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PolicyXRay from '../PolicyXRay';
import { HelmetProvider } from 'react-helmet-async';

// Mock lazy loaded components
vi.mock('../components/policy-xray/dashboard/LiveThreatFeed', () => ({ default: () => <div>LiveThreatFeed</div> }));
vi.mock('../components/policy-xray/dashboard/SafetyScoreGauge', () => ({ default: () => <div>SafetyScoreGauge</div> }));
vi.mock('../components/policy-xray/dashboard/MemePassportCard', () => ({ default: () => <div>MemePassportCard</div> }));
vi.mock('../components/policy-xray/dashboard/TokenExplorer', () => ({ default: () => <div>TokenExplorer</div> }));

describe('PolicyXRay', () => {
    it('renders scanner input and button', () => {
        render(
            <HelmetProvider>
                <PolicyXRay />
            </HelmetProvider>
        );
        expect(screen.getByLabelText('Policy ID Input')).toBeInTheDocument();
        expect(screen.getByLabelText('Analyze Policy')).toBeInTheDocument();
    });

    it('shows loading state and result on analyze', async () => {
        // Mock fetch
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                policy_id: 'test1234',
                type: 'Mock Script',
                risk_level: 'LOW',
                risk_score: 15,
                explanation: 'Mock explanation',
                details: {},
                timestamp: '2023-01-01',
                cached: false
            })
        });

        render(
            <HelmetProvider>
                <PolicyXRay />
            </HelmetProvider>
        );

        const input = screen.getByLabelText('Policy ID Input');
        fireEvent.change(input, { target: { value: 'test1234' } });

        const button = screen.getByLabelText('Analyze Policy');
        fireEvent.click(button);

        // Check loading
        expect(screen.getByLabelText('Loading analysis')).toBeInTheDocument();

        // Check result
        await waitFor(() => {
            const errorMsg = screen.queryByRole('alert');
            if (errorMsg) console.log("Error found:", errorMsg.textContent);
            // screen.debug(); // Print DOM
            expect(screen.getByText('MOCK SCRIPT')).toBeInTheDocument();
            expect(screen.getByText('Mock explanation')).toBeInTheDocument();
        });
    });
});
