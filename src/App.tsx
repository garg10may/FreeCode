import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import CoursePage from './pages/CoursePage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import ProblemListPage from './pages/ProblemListPage';
import TopInterview150 from './pages/TopInterview150';
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
            <Route path="/top-interview-150" element={<TopInterview150 />} />
            <Route path="/course" element={<CoursePage />} />
            <Route path="/course/:itemId" element={<CoursePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProblemsProvider>
      </ProgressProvider>
    </HashRouter>
  );
}
