import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import ProblemDetailPage from './pages/ProblemDetailPage';
import ProblemListPage from './pages/ProblemListPage';
import { ProblemsProvider } from './lib/problems';
import { ProgressProvider } from './lib/store';

export default function App() {
  return (
    <HashRouter>
      <ProgressProvider>
        <ProblemsProvider>
          <Header />
          <Routes>
            <Route path="/" element={<ProblemListPage />} />
            <Route path="/problems/:slug" element={<ProblemDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProblemsProvider>
      </ProgressProvider>
    </HashRouter>
  );
}
