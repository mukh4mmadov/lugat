import { Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import IELTSRecommendationModal from "./components/IELTSRecommendationModal";
import HomePage from "./pages/HomePage";
import { StudyHomePage, StudyModePage } from "./pages/StudyPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import { ListeningPage, QuizPage, WritingPage } from "./pages/PracticePages";
import { DifficultPage, FavoritesPage, SearchPage, SettingsPage, StatsPage } from "./pages/LibraryPages";
import CoursesPage from "./pages/CoursesPage";
import FutureUpdatesPage from "./pages/FutureUpdatesPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import RedirectIfAuthed from "./components/RedirectIfAuthed";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import RequireProfileComplete from "./components/RequireProfileComplete";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ProgressImportModal from "./components/ProgressImportModal";

export default function App() {
  const [showIELTSModal, setShowIELTSModal] = useState(false);

  const handleShowIELTSModal = () => {
    setShowIELTSModal(true);
  };

  return (
    <AuthProvider>
      <>
        <Routes>
          <Route element={<RequireProfileComplete><Layout onShowIELTSModal={handleShowIELTSModal} /></RequireProfileComplete>}>
            <Route index element={<HomePage />} />
            <Route path="study" element={<StudyHomePage />} />
            <Route path="study/:lessonId" element={<StudyModePage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:courseId" element={<CoursesPage />} />
            <Route path="lesson/:lessonId" element={<Navigate to="flashcards" replace />} />
            <Route path="lesson/:lessonId/flashcards" element={<FlashcardsPage />} />
            <Route path="lesson/:lessonId/listening" element={<ListeningPage />} />
            <Route path="lesson/:lessonId/quiz" element={<QuizPage />} />
            <Route path="lesson/:lessonId/writing" element={<WritingPage />} />
            <Route path="review" element={<FlashcardsPage review />} />
            <Route path="weak-words" element={<FlashcardsPage weak />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="difficult" element={<DifficultPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="future-updates" element={<FutureUpdatesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="complete-profile" element={<CompleteProfilePage />} />
          <Route path="register" element={
            <RedirectIfAuthed>
              <RegisterPage />
            </RedirectIfAuthed>
          } />
          <Route path="login" element={
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          } />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="auth/callback" element={<AuthCallbackPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsOfServicePage />} />
        </Routes>
        
        {/* IELTS Modal at root level - outside Layout */}
        <IELTSRecommendationModal 
          isOpen={showIELTSModal} 
          onClose={() => setShowIELTSModal(false)} 
        />
        <ProgressImportModal />
      </>
    </AuthProvider>
  );
}
