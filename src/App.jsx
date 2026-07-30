import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import FlashcardsPage from "./pages/FlashcardsPage";
import { ListeningPage, QuizPage, WritingPage } from "./pages/PracticePages";
import { DifficultPage, FavoritesPage, SearchPage, SettingsPage, StatsPage } from "./pages/LibraryPages";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="lesson/:lessonId" element={<Navigate to="flashcards" replace />} />
        <Route path="lesson/:lessonId/flashcards" element={<FlashcardsPage />} />
        <Route path="lesson/:lessonId/listening" element={<ListeningPage />} />
        <Route path="lesson/:lessonId/quiz" element={<QuizPage />} />
        <Route path="lesson/:lessonId/writing" element={<WritingPage />} />
        <Route path="review" element={<FlashcardsPage review />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="difficult" element={<DifficultPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
