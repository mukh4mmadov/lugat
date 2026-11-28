import { addedLessonsKnown, useContentVersion } from "./lib/contentVersion";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { lessonInfo } from "./data";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import RedirectIfAuthed from "./components/RedirectIfAuthed";
import RequireProfileComplete from "./components/RequireProfileComplete";
import PageLoader from "./components/PageLoader";
import PageTitle from "./components/PageTitle";
import { isChunkError, reloadForNewVersion } from "./lib/errorReport";
import RequireAccount from "./components/RequireAccount";

const page = (load, name = "default") =>
  lazy(() =>
    load().then(
      (module) => (module ? { default: module[name] } : new Promise(() => {})),
      (error) => {
        if (isChunkError(error) && reloadForNewVersion()) return new Promise(() => {});
        throw error;
      },
    ),
  );
const study = () => import("./pages/StudyPage");
const practice = () => import("./pages/PracticePages");
const library = () => import("./pages/LibraryPages");
const admin = () => import("./pages/AdminPage");
const topik = () => import("./pages/TopikPages");

const HomePage = page(() => import("./pages/HomePage"));
const wordSets = () => import("./pages/WordSetPages");
const StudyHub = page(wordSets, "StudyHub");
const ReviewHub = page(wordSets, "ReviewHub");
const LessonHome = page(wordSets, "LessonHome");
const UnitHome = page(wordSets, "UnitHome");
const StudyModePage = page(study, "StudyModePage");
const FlashcardsPage = page(() => import("./pages/FlashcardsPage"));
const WordListPage = page(() => import("./pages/WordListPage"));
const TopikUnitStudyPage = page(() => import("./pages/TopikUnitsPage"), "TopikUnitStudyPage");
const TopikPracticePage = page(() => import("./pages/TopikPracticePage"));
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
const AudioCreditsPage = page(() => import("./pages/AudioCreditsPage"));
const FeedbackPage = page(() => import("./pages/FeedbackPage"));
const LeaderboardPage = page(() => import("./pages/LeaderboardPage"));
const SpeakingPage = page(() => import("./pages/SpeakingPage"));
const koreaPages = () => import("./pages/KoreaStudyPages");
const KoreaHub = page(koreaPages, "KoreaHub");
const UniversityPage = page(koreaPages, "UniversityPage");
const AchievementsPage = page(() => import("./pages/AchievementsPage"));
const grammar = () => import("./pages/GrammarPage");
const GrammarCatalogPage = page(grammar, "GrammarCatalogPage");
const GrammarPointPage = page(grammar, "GrammarPointPage");
const storiesPages = () => import("./pages/StoriesPage");
const StoriesLibraryPage = page(storiesPages, "StoriesLibraryPage");
const guides = () => import("./pages/GuidesPage");
const GuidesIndexPage = page(guides, "GuidesIndexPage");
const GuidePage = page(guides, "GuidePage");
const StoryReaderPage = page(storiesPages, "StoryReaderPage");
const LessonStoriesPage = page(storiesPages, "LessonStoriesPage");
const AdminFeedbackPage = page(() => import("./pages/AdminFeedbackPage"));
const AdminPage = page(admin);
const AdminContent = page(admin, "AdminContent");
const AdminOverview = page(admin, "AdminOverview");
const AdminUsersPage = page(() => import("./pages/AdminUsersPage"));
const AdminWordsPage = page(() => import("./pages/AdminWordsPage"));
const adminTools = () => import("./pages/AdminToolsPage");
const AdminSettings = page(adminTools, "AdminSettings");
const AdminJournal = page(adminTools, "AdminJournal");
const AdminSpeaking = page(() => import("./components/admin/AdminSpeaking"));
const AdminGrowth = page(() => import("./components/admin/AdminGrowth"));
const AdminNotifications = page(() => import("./components/admin/AdminNotifications"));
const AdminErrors = page(() => import("./components/admin/AdminErrors"));
const AdminVoices = page(() => import("./components/admin/AdminVoices"));
const AdminActivity = page(() => import("./components/admin/AdminActivity"));
const AdminTexts = page(() => import("./components/admin/AdminTexts"));
const AdminHealth = page(() => import("./components/admin/AdminHealth"));
const AdminStudio = page(() => import("./components/admin/AdminStudio"));
const RecordVoicePage = page(() => import("./pages/RecordVoicePage"));
const TopikAttemptPage = page(topik, "TopikAttemptPage");
const TopikHomePage = page(topik, "TopikHomePage");
const TopikResultPage = page(topik, "TopikResultPage");
const TopikWordsPage = page(() => import("./pages/TopikWordsPage"));

function LessonRouteGuard({ children }) {
  const { lessonId } = useParams();
  const parsed = Number(lessonId);
  const valid =
    Number.isInteger(parsed) && parsed >= 1 && parsed <= lessonInfo.length;
  if (!valid) return addedLessonsKnown() ? <Navigate to="/404" replace /> : null;
  return children;
}

export default function App() {
  useContentVersion();
  return (
    <AuthProvider>
      <PageTitle />
      <Suspense fallback={<PageLoader fullScreen />}>
        <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route path="topik" element={<TopikHomePage />} />
            <Route path="topik/result/:attemptId" element={<TopikResultPage />} />
            <Route path="topik/words/:examId" element={<TopikWordsPage />} />
            <Route path="topik/practice/:typeKey" element={<RequireAccount><TopikPracticePage /></RequireAccount>} />
            <Route path="topik/:variantId" element={<RequireAccount><TopikAttemptPage /></RequireAccount>} />
          </Route>
          <Route
            element={
              <RequireProfileComplete>
                <Layout />
              </RequireProfileComplete>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="study" element={<StudyHub />} />
            <Route
              path="topic/:lessonId/study"
              element={
                <LessonRouteGuard>
                  <RequireAccount><StudyModePage /></RequireAccount>
                </LessonRouteGuard>
              }
            />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:courseId" element={<CoursesPage />} />
            <Route path="lesson/*" element={<Navigate to="/courses" replace />} />
            <Route path="study/:legacyLesson" element={<Navigate to="/courses" replace />} />
            <Route path="courses/1A" element={<Navigate to="/courses" replace />} />
            <Route path="courses/1B" element={<Navigate to="/courses" replace />} />
            <Route
              path="topic/:lessonId"
              element={
                <LessonRouteGuard>
                  <LessonHome />
                </LessonRouteGuard>
              }
            />
            <Route
              path="topic/:lessonId/flashcards"
              element={
                <LessonRouteGuard>
                  <RequireAccount><FlashcardsPage /></RequireAccount>
                </LessonRouteGuard>
              }
            />
            <Route
              path="topic/:lessonId/listening"
              element={
                <LessonRouteGuard>
                  <RequireAccount><ListeningPage /></RequireAccount>
                </LessonRouteGuard>
              }
            />
            <Route
              path="topic/:lessonId/quiz"
              element={
                <LessonRouteGuard>
                  <RequireAccount><QuizPage /></RequireAccount>
                </LessonRouteGuard>
              }
            />
            <Route
              path="topic/:lessonId/writing"
              element={
                <LessonRouteGuard>
                  <RequireAccount><WritingPage /></RequireAccount>
                </LessonRouteGuard>
              }
            />
            <Route
              path="topic/:lessonId/dictation"
              element={
                <LessonRouteGuard>
                  <RequireAccount><DictationPage /></RequireAccount>
                </LessonRouteGuard>
              }
            />
            <Route path="review" element={<RequireAccount><ReviewHub /></RequireAccount>} />
            <Route path="weak-words" element={<RequireAccount><FlashcardsPage weak /></RequireAccount>} />
            <Route path="search" element={<SearchPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="favorites/practice" element={<RequireAccount><FlashcardsPage list="favorites" /></RequireAccount>} />
            <Route path="difficult" element={<DifficultPage />} />
            <Route path="difficult/practice" element={<RequireAccount><FlashcardsPage list="difficult" /></RequireAccount>} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="words/:deckId" element={<WordListPage />} />
            <Route path="units/topik1" element={<Navigate to="/study?level=t1" replace />} />
            <Route path="units/topik2" element={<Navigate to="/study?level=t2b" replace />} />
            <Route path="units/:level/:unitId" element={<UnitHome />} />
            <Route path="units/:level/:unitId/study" element={<RequireAccount><TopikUnitStudyPage /></RequireAccount>} />
            <Route path="units/:level/:unitId/cards" element={<RequireAccount><FlashcardsPage unit /></RequireAccount>} />
            <Route path="future-updates" element={<FutureUpdatesPage />} />
            <Route path="credits/audio" element={<AudioCreditsPage />} />
            <Route path="record-voice" element={<RecordVoicePage />} />
            <Route path="premium" element={<PremiumPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="speaking" element={<SpeakingPage />} />
            <Route path="korea" element={<KoreaHub />} />
            <Route path="korea/u/:id" element={<UniversityPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="grammar" element={<GrammarCatalogPage />} />
            <Route path="grammar/:pointId" element={<GrammarPointPage />} />
            <Route path="stories" element={<StoriesLibraryPage />} />
            <Route path="guides" element={<GuidesIndexPage />} />
            <Route path="guides/:slug" element={<GuidePage />} />
            <Route path="stories/:storyId" element={<StoryReaderPage />} />
            <Route
              path="topic/:lessonId/stories"
              element={
                <LessonRouteGuard>
                  <LessonStoriesPage />
                </LessonRouteGuard>
              }
            />
            <Route
              path="topic/:lessonId/grammar"
              element={<Navigate to="/grammar" replace />}
            />
            <Route path="feedback/:ticketId" element={<FeedbackPage />} />
            <Route path="admin" element={<AdminPage />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="words" element={<AdminWordsPage />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="journal" element={<AdminJournal />} />
              <Route path="speaking" element={<AdminSpeaking />} />
              <Route path="growth" element={<AdminGrowth />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="errors" element={<AdminErrors />} />
              <Route path="voices" element={<AdminVoices />} />
              <Route path="activity" element={<AdminActivity />} />
              <Route path="texts" element={<AdminTexts />} />
              <Route path="health" element={<AdminHealth />} />
              <Route path="studio" element={<AdminStudio />} />
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
        </ErrorBoundary>

      </Suspense>
    </AuthProvider>
  );
}
