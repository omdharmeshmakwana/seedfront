import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import GeneratePage from './pages/GeneratePage';
import HistoryPage from './pages/HistoryPage';
import GenerationDetailPage from './pages/GenerationDetailPage';

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e3a',
            color: '#d9d9e3',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1e1e3a' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e1e3a' } },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<GeneratePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/generation/:id" element={<GenerationDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
