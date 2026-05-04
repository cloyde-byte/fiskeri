import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import MapPage from './pages/MapPage';
import FiskeguidePage from './pages/FiskeguidePage';
import FangstlogPage from './pages/FangstlogPage';
import FaellesskabPage from './pages/FaellesskabPage';
import ProfilPage from './pages/ProfilPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col max-w-lg mx-auto bg-white shadow-xl overflow-hidden" style={{ height: '100svh' }}>
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
      </AuthProvider>
    </BrowserRouter>
  );
}
