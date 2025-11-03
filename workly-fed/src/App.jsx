import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from "./common/security/ProtectedRoute";
import JobsPage from "./pages/JobsPage";
import UserContractsPage from "./pages/UserContractsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />   
      
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        } 
      > 
        <Route index element={<JobsPage />} />
        <Route path="contracts" element={<UserContractsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
