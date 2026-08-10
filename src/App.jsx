import { Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/Layout";
import IELTSRecommendationModal from "./components/IELTSRecommendationModal";
import HomePage from "./pages/HomePage";
import { StudyHomePage, StudyModePage } from "./pages/StudyPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import { ListeningPage, QuizPage, WritingPage } from "./pages/PracticePages";
import { DifficultPage, FavoritesPage, SearchPage, SettingsPage, StatsPage } from "./pages/LibraryPages";
import CoursesPage from "./pages/CoursesPage";
import FutureUpdatesPage from "./pages/FutureUpdatesPage";
import AIChatPage from "./pages/AIChatPage";

export default function App() {
  const [showIELTSModal, setShowIELTSModal] = useState(false);

  const handleShowIELTSModal = () => {
    setShowIELTSModal(true);
  };

  return (
    <>
      <Routes>
        <Route element={<Layout onShowIELTSModal={handleShowIELTSModal} />}>
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
          <Route path="ai-chat" element={<AIChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      
      {/* IELTS Modal at root level - outside Layout */}
      <IELTSRecommendationModal 
        isOpen={showIELTSModal} 
        onClose={() => setShowIELTSModal(false)} 
      />
    </>
  );
}
