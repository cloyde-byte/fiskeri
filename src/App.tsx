import { Component } from 'react';
import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import MapPage from './pages/MapPage';
import FiskeguidePage from './pages/FiskeguidePage';
import FangstlogPage from './pages/FangstlogPage';
import FaellesskabPage from './pages/FaellesskabPage';
import ProfilPage from './pages/ProfilPage';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#dc2626' }}>App fejl</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, marginTop: 12 }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <div
            className="flex flex-col max-w-lg mx-auto bg-white shadow-xl overflow-hidden"
            style={{ height: '100dvh' }}
          >
            <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <Routes>
                <Route path="/" element={<MapPage />} />
                <Route path="/fiskeguide" element={<FiskeguidePage />} />
                <Route path="/fangstlog" element={<FangstlogPage />} />
                <Route path="/faellesskab" element={<FaellesskabPage />} />
                <Route path="/profil" element={<ProfilPage />} />
              </Routes>
            </main>
            <Navigation />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
