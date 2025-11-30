import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { Suspense, lazy, Component, useContext } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null; errorInfo: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#060608] text-white px-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h1>
            <p className="text-gray-400 mb-4">{this.state.error?.message || 'Unknown error'}</p>
            {this.state.errorInfo && (
              <details className="text-left text-xs text-gray-500 bg-gray-900 p-4 rounded mb-4 max-h-60 overflow-auto">
                <summary className="cursor-pointer mb-2 text-gray-400">Error Details</summary>
                <pre>{this.state.error?.stack}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-neon text-black rounded-lg font-bold hover:bg-neon/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy Load Components
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./Home'));
const TradePage = lazy(() => import('./pages/TradePage'));
const MintPage = lazy(() => import('./pages/MintPage'));
const PassportPage = lazy(() => import('./pages/PassportPage'));
const AuditsPage = lazy(() => import('./pages/AuditsPage'));
const HypeAnalyzerPage = lazy(() => import('./pages/HypeAnalyzerPage'));
const TokenDetailPage = lazy(() => import('./pages/TokenDetailPage'));
const PolicyXRay = lazy(() => import('./pages/PolicyXRay'));
const PolicyXRayAnalysis = lazy(() => import('./pages/PolicyXRayAnalysis'));
const BundleInspector = lazy(() => import('./pages/BundleInspector'));
const SafetyTools = lazy(() => import('./pages/SafetyTools'));
const MPMLab = lazy(() => import('./pages/MPMLab'));
const MasumiNaughty = lazy(() => import('./pages/MasumiNaughty'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#060608] text-neon">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
      <span className="font-heading tracking-widest">LOADING NEXGUARD...</span>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useContext(AuthContext);
  // For now, if no token, redirect to login. 
  // In a real app, you might want to verify the token validity.
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  // Force HMR update
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <WalletProvider>
          <AuthProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Protected App Routes */}
                  <Route path="/app/*" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Routes>
                          <Route index element={<Home />} />
                          <Route path="trade" element={<TradePage />} />
                          <Route path="mint" element={<MintPage />} />
                          <Route path="passport" element={<PassportPage />} />
                          <Route path="audits" element={<AuditsPage />} />
                          <Route path="explorer" element={<HypeAnalyzerPage />} />
                          <Route path="token/:id" element={<TokenDetailPage />} />
                          <Route path="policy-xray" element={<PolicyXRay />} />
                          <Route path="policy-xray/:id" element={<PolicyXRayAnalysis />} />
                          <Route path="bundle-inspector" element={<BundleInspector />} />
                          <Route path="tools" element={<SafetyTools />} />
                          <Route path="mpm-lab" element={<MPMLab />} />
                          <Route path="naughty" element={<MasumiNaughty />} />
                          <Route path="*" element={<Navigate to="/app" replace />} />
                        </Routes>
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />

                  {/* Public Website Routes */}
                  <Route path="/docs" element={
                    <>
                      <Header />
                      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-white">
                        <h1 className="text-4xl font-bold mb-8">Documentation</h1>
                        <p className="text-gray-400">Coming soon...</p>
                      </div>
                      <Footer />
                    </>
                  } />

                  {/* Standalone Public Tools */}
                  <Route path="/bundle-inspector" element={<BundleInspector />} />
                  <Route path="/tools" element={<SafetyTools />} />
                  <Route path="/mpm-lab" element={
                    <DashboardLayout>
                      <MPMLab />
                    </DashboardLayout>
                  } />

                  {/* Landing & Auth Routes (Catch-all for root) */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/*" element={<Landing />} />

                  {/* 404 Fallback for unhandled routes not caught by Landing */}
                  <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center text-white">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">404</h1>
                        <p>Page not found: {window.location.pathname}</p>
                      </div>
                    </div>
                  } />
                </Routes>
              </Suspense>
            </Router>
          </AuthProvider>
        </WalletProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
