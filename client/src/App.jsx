import { Routes, Route, Navigate } from 'react-router-dom';
import FeedbackForm from './pages/FeedbackForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Routes>
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
