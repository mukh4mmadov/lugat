import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { lessonInfo } from "./data";
import Layout from "./components/Layout";
import IELTSRecommendationModal from "./components/IELTSRecommendationModal";
import ProgressImportModal from "./components/ProgressImportModal";
import RedirectIfAuthed from "./components/RedirectIfAuthed";
import RequireProfileComplete from "./components/RequireProfileComplete";
import PageLoader from "./components/PageLoader";
import PageTitle from "./components/PageTitle";

// Each page is its own chunk, so the first visit only downloads what it shows.
const page = (load, name = "default") => lazy(() => load().then((module) => ({ default: module[name] })));
const study = () => import("./pages/StudyPage");
const practice = () => import("./pages/PracticePages");
const library = () => import("./pages/LibraryPages");
const admin = () => import("./pages/AdminPage");
const topik = () => import("./pages/TopikPages");

const HomePage = page(() => import("./pages/HomePage"));
const StudyHomePage = page(study, "StudyHomePage");
const StudyModePage = page(study, "StudyModePage");
const FlashcardsPage = page(() => import("./pages/FlashcardsPage"));
const ListeningPage = page(practice, "ListeningPage");
const QuizPage = page(practice, "QuizPage");
const WritingPage = page(practice, "WritingPage");
const DictationPage = page(practice, "DictationPage");
const DifficultPage = page(library, "DifficultPage");
const FavoritesPage = page(library, "FavoritesPage");
const SearchPage = page(library, "SearchPage");
const SettingsPage = page(library, "SettingsPage");
const StatsPage = page(library, "StatsPage");
const CoursesPage = page(() => import("./pages/CoursesPage"));
const FutureUpdatesPage = page(() => import("./pages/FutureUpdatesPage"));
const PremiumPage = page(() => import("./pages/PremiumPage"));
const RegisterPage = page(() => import("./pages/RegisterPage"));
const LoginPage = page(() => import("./pages/LoginPage"));
const ForgotPasswordPage = page(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = page(() => import("./pages/ResetPasswordPage"));
const AuthCallbackPage = page(() => import("./pages/AuthCallbackPage"));
const CompleteProfilePage = page(() => import("./pages/CompleteProfilePage"));
const PrivacyPolicyPage = page(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = page(() => import("./pages/TermsOfServicePage"));
const NotFoundPage = page(() => import("./pages/NotFoundPage"));
const FeedbackPage = page(() => import("./pages/FeedbackPage"));
const LeaderboardPage = page(() => import("./pages/LeaderboardPage"));
const AdminFeedbackPage = page(() => import("./pages/AdminFeedbackPage"));
const AdminPage = page(admin);
const AdminContent = page(admin, "AdminContent");
const AdminOverview = page(admin, "AdminOverview");
const AdminUsersPage = page(() => import("./pages/AdminUsersPage"));
const AdminWordsPage = page(() => import("./pages/AdminWordsPage"));
const TopikAttemptPage = page(topik, "TopikAttemptPage");
const TopikHomePage = page(topik, "TopikHomePage");
const TopikResultPage = page(topik, "TopikResultPage");
const TopikWordsPage = page(() => import("./pages/TopikWordsPage"));

function LessonRouteGuard({ children }) {
  const { lessonId } = useParams();
  const parsed = Number(lessonId);
  const valid =
    Number.isInteger(parsed) && parsed >= 1 && parsed <= lessonInfo.length;
  if (!valid) return <Navigate to="/404" replace />;
  return children;
}

export default function App() {
  const [showIELTSModal, setShowIELTSModal] = useState(false);

  const handleShowIELTSModal = () => {
    setShowIELTSModal(true);
  };

  return (
    <AuthProvider>
      <PageTitle />
      <Suspense fallback={<PageLoader fullScreen />}>
        <Routes>
          <Route element={<Layout onShowIELTSModal={handleShowIELTSModal} />}>
            <Route path="topik" element={<TopikHomePage />} />
            <Route path="topik/result/:attemptId" element={<TopikResultPage />} />
            <Route path="topik/words/:examId" element={<TopikWordsPage />} />
            <Route path="topik/:variantId" element={<TopikAttemptPage />} />
          </Route>
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
            <Route
              path="lesson/:lessonId/dictation"
              element={
                <LessonRouteGuard>
                  <DictationPage />
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
            <Route path="premium" element={<PremiumPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="feedback/:ticketId" element={<FeedbackPage />} />
            <Route path="admin" element={<AdminPage />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="words" element={<AdminWordsPage />} />
              <Route path="content" element={<AdminContent />} />
            </Route>
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
      </Suspense>
    </AuthProvider>
  );
}
