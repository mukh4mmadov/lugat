import { Navigate, Route, Routes, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { lessonInfo } from "./data";
import Layout from "./components/Layout";
import IELTSRecommendationModal from "./components/IELTSRecommendationModal";
import ProgressImportModal from "./components/ProgressImportModal";
import HomePage from "./pages/HomePage";
import { StudyHomePage, StudyModePage } from "./pages/StudyPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import { ListeningPage, QuizPage, WritingPage } from "./pages/PracticePages";
import {
  DifficultPage,
  FavoritesPage,
  SearchPage,
  SettingsPage,
  StatsPage,
} from "./pages/LibraryPages";
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
import NotFoundPage from "./pages/NotFoundPage";
import FeedbackPage from "./pages/FeedbackPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";
import AdminPage from "./pages/AdminPage";
import { TopikAttemptPage, TopikHomePage, TopikResultPage } from "./pages/TopikPages";

function LessonRouteGuard({ children }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const parsed = Number(lessonId);
  const valid =
    Number.isInteger(parsed) && parsed >= 1 && parsed <= lessonInfo.length;
  if (!valid) {
    navigate("/404", { replace: true });
    return null;
  }
  return children;
}

export default function App() {
  const [showIELTSModal, setShowIELTSModal] = useState(false);

  const handleShowIELTSModal = () => {
    setShowIELTSModal(true);
  };

  return (
    <AuthProvider>
      <>
        <Routes>
          <Route
            element={
              <RequireProfileComplete>
                <Layout onShowIELTSModal={handleShowIELTSModal} />
              </RequireProfileComplete>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="study" element={<StudyHomePage />} />
            <Route
              path="study/:lessonId"
              element={
                <LessonRouteGuard>
                  <StudyModePage />
                </LessonRouteGuard>
              }
            />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:courseId" element={<CoursesPage />} />
            <Route path="topik" element={<TopikHomePage />} />
            <Route path="topik/result/:attemptId" element={<TopikResultPage />} />
            <Route path="topik/:variantId" element={<TopikAttemptPage />} />
            <Route
              path="lesson/:lessonId"
              element={<Navigate to="flashcards" replace />}
            />
            <Route
              path="lesson/:lessonId/flashcards"
              element={
                <LessonRouteGuard>
                  <FlashcardsPage />
                </LessonRouteGuard>
              }
            />
            <Route
              path="lesson/:lessonId/listening"
              element={
                <LessonRouteGuard>
                  <ListeningPage />
                </LessonRouteGuard>
              }
            />
            <Route
              path="lesson/:lessonId/quiz"
              element={
                <LessonRouteGuard>
                  <QuizPage />
                </LessonRouteGuard>
              }
            />
            <Route
              path="lesson/:lessonId/writing"
              element={
                <LessonRouteGuard>
                  <WritingPage />
                </LessonRouteGuard>
              }
            />
            <Route path="review" element={<FlashcardsPage review />} />
            <Route path="weak-words" element={<FlashcardsPage weak />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="difficult" element={<DifficultPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="future-updates" element={<FutureUpdatesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="admin/feedback" element={<AdminFeedbackPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="complete-profile" element={<CompleteProfilePage />} />
          <Route
            path="register"
            element={
              <RedirectIfAuthed>
                <RegisterPage />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="auth/callback" element={<AuthCallbackPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsOfServicePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <IELTSRecommendationModal
          isOpen={showIELTSModal}
          onClose={() => setShowIELTSModal(false)}
        />
        <ProgressImportModal />
      </>
    </AuthProvider>
  );
}
