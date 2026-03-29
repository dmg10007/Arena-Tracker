import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';

// Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import DeckPage from './pages/DeckPage';
import CollectionPage from './pages/CollectionPage';
import DraftPage from './pages/DraftPage';
import MetaPage from './pages/MetaPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--space-5)',
              background: 'var(--bg-deep)',
            }}
          >
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/decks" element={<DeckPage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/draft" element={<DraftPage />} />
                <Route path="/meta" element={<MetaPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
