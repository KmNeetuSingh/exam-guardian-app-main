import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/student/Dashboard";
import ExamStart from "./pages/student/ExamStart";
import ExamTakingPage from "./pages/student/ExamTakingPage";
import ProctorDashboard from "./pages/proctor/Dashboard";
import CreateExam from "./pages/proctor/CreateExam";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <AuthProvider>
              <NotificationProvider>
                <MainLayout />
              </NotificationProvider>
            </AuthProvider>
          }>
            <Route index element={<Index />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="student/dashboard" element={<StudentDashboard />} />
            <Route path="student/start-exam/:examId" element={<ExamStart />} />
            <Route path="student/exam/:examId" element={<ExamTakingPage />} />
            <Route path="proctor/dashboard" element={<ProctorDashboard />} />
            <Route path="proctor/create-exam" element={<CreateExam />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
