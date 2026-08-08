import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import GlassCard from "../components/GlassCard";
import WordBadge from "../components/WordBadge";
import { getLessonWords, getWordKey, lessonInfo } from "../data";
import { markWordStudied, selectStudyProgress } from "../store";
import { speakKorean } from "../lib/speech";

function StudyDevelopmentNotice() {
  const { t } = useTranslation();

  const improvingItems = [
    t("studyDevelopment.improving.flow"),
    t("studyDevelopment.improving.selection"),
    t("studyDevelopment.improving.repetition"),
    t("studyDevelopment.improving.variety"),
    t("studyDevelopment.improving.mastery"),
    t("studyDevelopment.improving.reinforcement"),
    t("studyDevelopment.improving.ui"),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <GlassCard className="relative overflow-hidden border border-amber-200/60 bg-amber-50/80 dark:border-amber-400/20 dark:bg-amber-950/30">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="relative space-y-5 p-6 md:p-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {t("studyDevelopment.title")}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {t("studyDevelopment.subtitle")}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
              {t("studyDevelopment.improvingTitle")}
            </h4>
            <ul className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
              {improvingItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-200/60 bg-white/50 p-4 dark:border-amber-400/20 dark:bg-white/5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
              {t("studyDevelopment.importantTitle")}
            </h4>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {t("studyDevelopment.importantText")}
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Study Home — lists all 14 lessons, same card look as the Home page  */
/* ------------------------------------------------------------------ */

export function StudyHomePage() {
  const { t } = useTranslation();
  const progress = useSelector((state) => state.progress);

  return (
    <div className="space-y-8">
      <GlassCard className="relative overflow-hidden p-8 md:p-10">
        <div className="absolute right-6 top-6 hidden h-36 w-36 rounded-full bg-emerald-300/25 blur-3xl md:block" />
        <WordBadge tone="green">{t("study.learnFirst")}</WordBadge>
        <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">{t("study.title")}</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          {t("study.subtitle")}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-300">
          <span className="rounded-full bg-slate-950/5 px-4 py-2 dark:bg-white/10">{t("nav.study")}</span>
          <span>→</span>
          <span className="rounded-full bg-slate-950/5 px-4 py-2 dark:bg-white/10">{t("practice.flashcards")}</span>
        </div>
      </GlassCard>

      <StudyDevelopmentNotice />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lessonInfo.map((lesson, index) => {
          const percent = selectStudyProgress({ progress }, lesson.lesson);
          return (
            <motion.article
              key={lesson.lesson}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-xl font-black text-white shadow-lg">
                  {lesson.lesson}
                </div>
                <WordBadge tone={percent === 100 ? "green" : "violet"}>{lesson.count} {t("home.words")}</WordBadge>
              </div>
              <h3 className="mt-5 text-xl font-black">{t("card.lesson", { lesson: lesson.lesson })}</h3>
              <p className="mt-2 min-h-12 text-sm capitalize text-slate-600 dark:text-slate-300">{lesson.category}</p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${percent}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-500 dark:text-slate-300">
                <span>{percent}% {t("nav.study")}</span>
                <Link className="text-sky-600 transition group-hover:translate-x-1 dark:text-sky-300" to={`/study/${lesson.lesson}`}>
                  {t("button.continue")}
                </Link>
              </div>
            </motion.article>
          );
        })}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Active Learning Study Mode — cumulative mastery with genuine exercise variety */
/* ------------------------------------------------------------------ */

const WORDS_PER_BATCH = 2; // Learn 2 words at a time
const MASTERY_THRESHOLD = 3; // Need 3 correct answers
const MASTERY_DIFFERENT_TYPES = 2; // Need success in 2 different exercise types
const ACTIVE_RECALL_TYPES = ['typingChallenge', 'missingSyllable', 'sentenceContext']; // Active recall exercises

// Exercise types grouped by difficulty
const EXERCISE_BY_DIFFICULTY = {
  easy: ['koreanToUzbek', 'uzbekToKorean', 'listeningToKorean'],
  medium: ['trueFalse', 'listeningToMeaning', 'missingSyllable'],
  hard: ['typingChallenge', 'sentenceContext']
};

// All exercise types with different mechanics
const EXERCISE_TYPES = [
  'koreanToUzbek',      // Korean → Uzbek (multiple choice recognition)
  'uzbekToKorean',      // Uzbek → Korean (reverse recognition)
  'listeningToKorean',  // Audio → identify Korean (auditory recognition)
  'trueFalse',          // Correct/incorrect translation (binary judgment)
  'missingSyllable',    // Complete Korean romanization (partial recall)
  'typingChallenge',    // Type the Korean word (active recall)
  'listeningToMeaning', // Audio → meaning (auditory to meaning)
  'sentenceContext'     // Korean sentence → identify target word (contextual recall)
];

const SUCCESS_MESSAGES = [
  'Nice!', 'Great!', 'Excellent!', 'Perfect!', 'Awesome!', 'Keep going!'
];

const ALMOST_MESSAGES = [
  'Almost!', 'Close!', 'Let\'s remember this one', 'Almost there!'
];

export function StudyModePage() {
  const { t } = useTranslation();
  const { lessonId = "1" } = useParams();
  const lesson = Number(lessonId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sourceWords = useMemo(() => getLessonWords(lesson), [lesson]);
  
  // Cumulative learning state
  const [wordQueue, setWordQueue] = useState([]); // All words in order
  const [learnedWords, setLearnedWords] = useState([]); // Words introduced so far
  const [currentBatch, setCurrentBatch] = useState([]); // Current 2 words being learned
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Index in current batch
  
  // Mastery tracking
  const [wordMastery, setWordMastery] = useState({}); // { wordKey: { correctCount: 0, exerciseTypes: [], mastered: false, activeRecallSuccess: false } }
  const [reviewQueue, setReviewQueue] = useState([]); // Words that need retesting
  const [reinforcementWord, setReinforcementWord] = useState(null); // Word currently being reinforced after wrong answer
  
  // Session state
  const [sessionState, setSessionState] = useState('learning'); // 'learning', 'checkpoint', 'testing', 'completed'
  const [currentExercise, setCurrentExercise] = useState(null);
  const [lastExerciseType, setLastExerciseType] = useState(null);
  const [lastTestedWordId, setLastTestedWordId] = useState(null); // Track last tested word to avoid repetition
  const [feedback, setFeedback] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    totalTime: 0,
    mastered: 0,
    needsReview: 0
  });
  
  // Sentence learning mode
  const [showSentenceMode, setShowSentenceMode] = useState(false);

  // Initialize session
  useEffect(() => {
    if (sourceWords.length > 0) {
      const shuffled = [...sourceWords].sort(() => Math.random() - 0.5);
      setWordQueue(shuffled);
      setStartTime(Date.now());
      // Start with first batch of 2 words
      setCurrentBatch(shuffled.slice(0, WORDS_PER_BATCH));
      setLearnedWords(shuffled.slice(0, WORDS_PER_BATCH));
    }
  }, [sourceWords]);

  // Mark word as studied for progress tracking
  useEffect(() => {
    learnedWords.forEach(word => {
      dispatch(markWordStudied(getWordKey(word)));
    });
  }, [learnedWords, dispatch]);

  // Progress calculation
  const totalWords = sourceWords.length;
  const introducedCount = learnedWords.length;
  const masteredCount = Object.values(wordMastery).filter(m => m.mastered).length;
  const needsReviewCount = Object.values(wordMastery).filter(m => !m.mastered).length;
  
  const progressPercent = totalWords > 0 
    ? Math.round((introducedCount / totalWords) * 100) 
    : 0;
    
  const masteryPercent = introducedCount > 0
    ? Math.round((masteredCount / introducedCount) * 100)
    : 0;

  const currentWord = currentBatch[currentWordIndex];

  // Audio feedback
  const playSuccessSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio not supported
    }
  }, []);

  const playErrorSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 300;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      // Audio not supported
    }
  }, []);

  // Generate cumulative exercise with adaptive difficulty
  const generateCumulativeExercise = useCallback(() => {
    if (learnedWords.length === 0) return null;

    // Select a word based on adaptive sampling with anti-repetition
    const learnedWithMastery = learnedWords.map(word => ({
      word,
      mastery: wordMastery[getWordKey(word)] || { correctCount: 0, exerciseTypes: [], mastered: false, activeRecallSuccess: false }
    }));
    
    // Priority 1: Review queue words (words that were answered incorrectly)
    if (reviewQueue.length > 0) {
      const reviewWord = reviewQueue[0].word;
      // Exclude last tested word if other eligible words exist
      const eligibleForReview = learnedWithMastery.filter(item => 
        item.word.id !== lastTestedWordId || learnedWithMastery.length === 1
      );
      if (eligibleForReview.length > 0) {
        const targetWord = eligibleForReview.find(item => item.word.id === reviewWord.id)?.word || eligibleForReview[0].word;
        return createExerciseForWord(targetWord);
      }
    }
    
    // Priority 2: Unmastered words (excluding last tested if possible)
    const unmastered = learnedWithMastery.filter(item => !item.mastery.mastered && item.word.id !== lastTestedWordId);
    if (unmastered.length > 0) {
      const targetWord = unmastered[Math.floor(Math.random() * unmastered.length)].word;
      return createExerciseForWord(targetWord);
    }
    
    // Priority 3: If all unmastered were the last tested word, try again without exclusion
    const allUnmastered = learnedWithMastery.filter(item => !item.mastery.mastered);
    if (allUnmastered.length > 0) {
      const targetWord = allUnmastered[Math.floor(Math.random() * allUnmastered.length)].word;
      return createExerciseForWord(targetWord);
    }
    
    // Priority 4: Newly introduced words (low correctCount)
    const newWords = learnedWithMastery.filter(item => item.mastery.correctCount === 0);
    const eligibleNew = newWords.filter(item => item.word.id !== lastTestedWordId);
    if (eligibleNew.length > 0) {
      const targetWord = eligibleNew[Math.floor(Math.random() * eligibleNew.length)].word;
      return createExerciseForWord(targetWord);
    }
    
    // Priority 5: Developing words (not mastered, some progress)
    const developing = learnedWithMastery.filter(item => 
      !item.mastery.mastered && 
      item.mastery.correctCount > 0 && 
      item.mastery.correctCount < MASTERY_THRESHOLD &&
      item.word.id !== lastTestedWordId
    );
    if (developing.length > 0) {
      const targetWord = developing[Math.floor(Math.random() * developing.length)].word;
      return createExerciseForWord(targetWord);
    }
    
    // Priority 6: Mastered words (only occasionally, and avoid consecutive)
    const mastered = learnedWithMastery.filter(item => item.mastery.mastered && item.word.id !== lastTestedWordId);
    if (mastered.length > 0 && Math.random() > 0.7) { // 30% chance for mastered words
      const targetWord = mastered[Math.floor(Math.random() * mastered.length)].word;
      return createExerciseForWord(targetWord);
    }
    
    // Fallback: if no eligible words found (shouldn't happen in normal flow)
    const fallback = learnedWithMastery[Math.floor(Math.random() * learnedWithMastery.length)];
    return createExerciseForWord(fallback.word);
  }, [learnedWords, sourceWords, lastExerciseType, wordMastery, reviewQueue, lastTestedWordId]);

  // Helper function to create exercise for a specific word
  const createExerciseForWord = useCallback((targetWord) => {
    // Determine difficulty based on mastery
    const mastery = wordMastery[getWordKey(targetWord)] || { correctCount: 0, exerciseTypes: [], mastered: false };
    let difficultyLevel;
    
    if (mastery.correctCount === 0) {
      difficultyLevel = 'easy'; // First exposure - recognition
    } else if (mastery.correctCount < MASTERY_THRESHOLD || !mastery.activeRecallSuccess) {
      difficultyLevel = 'medium'; // Developing - mixed
    } else {
      difficultyLevel = 'hard'; // Strong - active recall
    }
    
    // Get available exercise types for this difficulty
    const availableDifficultyTypes = EXERCISE_BY_DIFFICULTY[difficultyLevel];
    
    // Randomize exercise type (avoid consecutive same type)
    const availableTypes = availableDifficultyTypes.filter(t => t !== lastExerciseType);
    const exerciseType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    setLastExerciseType(exerciseType);

    // Track last tested word
    setLastTestedWordId(targetWord.id);

    // Get distractors from all source words
    const distractors = sourceWords
      .filter(w => w.id !== targetWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

    return {
      type: exerciseType,
      word: targetWord,
      options: allOptions,
      correctIndex: allOptions.findIndex(w => w.id === targetWord.id)
    };
  }, [sourceWords, lastExerciseType, wordMastery]);

  // Handle exercise answer
  const handleExerciseAnswer = useCallback((isCorrect, exercise) => {
    const wordKey = getWordKey(exercise.word);
    
    // Update mastery tracking
    setWordMastery(prev => {
      const currentMastery = prev[wordKey] || { correctCount: 0, exerciseTypes: [], mastered: false, activeRecallSuccess: false };
      let newMastery = { ...currentMastery };
      
      if (isCorrect) {
        newMastery.correctCount = currentMastery.correctCount + 1;
        newMastery.exerciseTypes = [...new Set([...currentMastery.exerciseTypes, exercise.type])];
        
        // Track active recall success
        if (ACTIVE_RECALL_TYPES.includes(exercise.type)) {
          newMastery.activeRecallSuccess = true;
        }
        
        // Check mastery conditions
        const hasEnoughCorrect = newMastery.correctCount >= MASTERY_THRESHOLD;
        const hasDifferentTypes = new Set(newMastery.exerciseTypes).size >= MASTERY_DIFFERENT_TYPES;
        const hasActiveRecall = newMastery.activeRecallSuccess;
        newMastery.mastered = hasEnoughCorrect && hasDifferentTypes && hasActiveRecall;
        
        setSessionStats(prev => ({ 
          ...prev, 
          correct: prev.correct + 1,
          mastered: newMastery.mastered ? prev.mastered + 1 : prev.mastered
        }));
        playSuccessSound();
        setFeedback({
          type: 'success',
          message: SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]
        });
      } else {
        // Reset progress on wrong answer
        newMastery.correctCount = Math.max(0, currentMastery.correctCount - 1);
        newMastery.mastered = false;
        // Don't reset activeRecallSuccess immediately - they may still have it
        
        setSessionStats(prev => ({ 
          ...prev, 
          incorrect: prev.incorrect + 1,
          needsReview: !newMastery.mastered ? prev.needsReview + 1 : prev.needsReview
        }));
        playErrorSound();
        
        // Show reinforcement instead of simple feedback
        setReinforcementWord(exercise.word);
        setFeedback({
          type: 'error',
          message: ALMOST_MESSAGES[Math.floor(Math.random() * ALMOST_MESSAGES.length)],
          correctAnswer: exercise.word
        });
        
        // Add to review queue with short delay
        setReviewQueue(prev => [...prev, { word: exercise.word, delay: 2 }]);
      }
      
      return { ...prev, [wordKey]: newMastery };
    });

    // Note: Feedback and reinforcementWord are cleared by ReinforcementCard's onContinue callback
    // or by a separate timeout if not in reinforcement mode
    if (!reinforcementWord) {
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  }, [playSuccessSound, playErrorSound]);

  // Process review queue
  useEffect(() => {
    if (reviewQueue.length > 0 && sessionState === 'testing') {
      const reviewItem = reviewQueue[0];
      if (reviewItem.delay === 0) {
        // Time to review this word
        setReviewQueue(prev => {
          const [item, ...rest] = prev;
          // Generate exercise for review word
          const exercise = generateCumulativeExercise();
          if (exercise) {
            setCurrentExercise({ ...exercise, word: item.word });
          }
          return rest;
        });
      } else {
        // Decrease delay
        setReviewQueue(prev => {
          const [item, ...rest] = prev;
          return [{ ...item, delay: item.delay - 1 }, ...rest];
        });
      }
    }
  }, [sessionState, reviewQueue, generateCumulativeExercise]);

  // Handle learning word interaction
  const handleWordLearned = useCallback(() => {
    const newIndex = currentWordIndex + 1;
    
    if (newIndex >= currentBatch.length) {
      // Batch complete, trigger checkpoint
      setSessionState('checkpoint');
    } else {
      setCurrentWordIndex(newIndex);
    }
  }, [currentWordIndex, currentBatch.length]);

  // Handle checkpoint (test all learned words)
  const handleCheckpoint = useCallback(() => {
    setSessionState('testing');
    const exercise = generateCumulativeExercise();
    setCurrentExercise(exercise);
  }, [generateCumulativeExercise]);

  // Handle exercise completion
  const handleExerciseComplete = useCallback(() => {
    // If reinforcement card is active, do NOT generate next exercise
    // Wait for user to click Continue on ReinforcementCard
    if (reinforcementWord) {
      return;
    }

    setTimeout(() => {
      // Check if all learned words are mastered
      const allMastered = learnedWords.every(word => {
        const mastery = wordMastery[getWordKey(word)];
        return mastery && mastery.mastered;
      });

      if (allMastered) {
        // All current words mastered, add next batch
        const nextBatchStart = learnedWords.length;
        if (nextBatchStart < wordQueue.length) {
          const nextBatch = wordQueue.slice(nextBatchStart, nextBatchStart + WORDS_PER_BATCH);
          setCurrentBatch(nextBatch);
          setLearnedWords(prev => [...prev, ...nextBatch]);
          setCurrentWordIndex(0);
          setSessionState('learning');
        } else {
          // All words introduced, check total mastery
          const totalMastered = wordQueue.every(word => {
            const mastery = wordMastery[getWordKey(word)];
            return mastery && mastery.mastered;
          });

          if (totalMastered) {
            // Lesson complete
            setSessionState('completed');
            setSessionStats(prev => ({
              ...prev,
              totalTime: Math.round((Date.now() - startTime) / 1000)
            }));
          } else {
            // Still need to practice unmastered words
            const exercise = generateCumulativeExercise();
            setCurrentExercise(exercise);
          }
        }
      } else {
        // Continue testing unmastered words
        const exercise = generateCumulativeExercise();
        setCurrentExercise(exercise);
      }
    }, 300);
  }, [learnedWords, wordMastery, wordQueue, generateCumulativeExercise, startTime, reinforcementWord]);

  // Study again
  const studyAgain = useCallback(() => {
    const shuffled = [...sourceWords].sort(() => Math.random() - 0.5);
    setWordQueue(shuffled);
    setCurrentBatch(shuffled.slice(0, WORDS_PER_BATCH));
    setLearnedWords(shuffled.slice(0, WORDS_PER_BATCH));
    setCurrentWordIndex(0);
    setWordMastery({});
    setReviewQueue([]);
    setSessionState('learning');
    setCurrentExercise(null);
    setFeedback(null);
    setReinforcementWord(null);
    setLastExerciseType(null);
    setLastTestedWordId(null);
    setSessionStats({ correct: 0, incorrect: 0, totalTime: 0, mastered: 0, needsReview: 0 });
    setStartTime(Date.now());
    setShowSentenceMode(false);
  }, [sourceWords]);

  if (!sourceWords.length) {
    return (
      <GlassCard className="mx-auto max-w-2xl text-center">
        <WordBadge tone="amber">{t("nav.study")}</WordBadge>
        <h2 className="mt-4 text-3xl font-black">{t("study.lessonNotFound")}</h2>
        <Link className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-black text-white dark:bg-white dark:text-slate-950" to="/study">
          {t("common.back")}
        </Link>
      </GlassCard>
    );
  }

  if (sessionState === 'completed') {
    const accuracy = sessionStats.correct + sessionStats.incorrect > 0
      ? Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)
      : 0;

    const totalMastered = wordQueue.every(word => {
      const mastery = wordMastery[getWordKey(word)];
      return mastery && mastery.mastered;
    });

    return (
      <div className="space-y-6">
        <StudyHeader 
          lesson={lesson} 
          introduced={introducedCount} 
          total={totalWords}
          mastered={masteredCount}
        />
        <GlassCard className="mx-auto max-w-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center"
          >
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-3xl"
              >
                {totalMastered ? '🎉' : '📚'}
              </motion.div>
            </div>
            
            <WordBadge tone={totalMastered ? "green" : "amber"}>
              {totalMastered ? t("study.lessonCompleted") : "Practice Needed"}
            </WordBadge>
            <h2 className="mt-4 text-4xl font-black">
              {totalMastered ? t("study.lessonCompleted") : "Keep Practicing"}
            </h2>
            
            <div className="mt-8 grid gap-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
                <span className="text-slate-600 dark:text-slate-300">Words Introduced</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{introducedCount} / {totalWords}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
                <span className="text-slate-600 dark:text-slate-300">Words Mastered</span>
                <span className="text-2xl font-black text-emerald-500">{masteredCount} / {introducedCount}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
                <span className="text-slate-600 dark:text-slate-300">Accuracy</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{accuracy}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
                <span className="text-slate-600 dark:text-slate-300">Study Time</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{sessionStats.totalTime}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Needs Review</span>
                <span className="text-2xl font-black text-orange-500">{needsReviewCount}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button 
                type="button" 
                onClick={studyAgain}
                className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white transition hover:scale-105 dark:bg-white dark:text-slate-950"
              >
                {totalMastered ? t("home.studyAgain") : "Continue Practice"}
              </button>
              {totalMastered && (
                <button 
                  type="button" 
                  onClick={() => navigate(`/lesson/${lesson}/flashcards`)}
                  className="rounded-2xl bg-emerald-500 px-6 py-3 font-black text-white transition hover:scale-105"
                >
                  {t("practice.flashcards")}
                </button>
              )}
              {totalMastered && lesson < 14 && (
                <button 
                  type="button" 
                  onClick={() => navigate(`/study/${lesson + 1}`)}
                  className="rounded-2xl bg-sky-500 px-6 py-3 font-black text-white transition hover:scale-105"
                >
                  Next Lesson →
                </button>
              )}
            </div>
          </motion.div>
        </GlassCard>
    </div>
  );
}

  return (
    <div className="space-y-6">
      <StudyHeader lesson={lesson} progress={progressPercent} />
      
      <StudyDevelopmentNotice />
      
      <AnimatePresence mode="wait">
        {sessionState === 'learning' && currentWord && (
          <LearningCard
            key={`learn-${currentWord.id}`}
            word={currentWord}
            mastery={wordMastery[getWordKey(currentWord)]}
            onLearned={handleWordLearned}
            feedback={feedback}
            showSentenceMode={showSentenceMode}
            onToggleSentenceMode={() => setShowSentenceMode(!showSentenceMode)}
          />
        )}
        
        {sessionState === 'checkpoint' && (
          <CheckpointScreen
            wordCount={learnedWords.length}
            masteredCount={masteredCount}
            onStart={handleCheckpoint}
          />
        )}
        
        {sessionState === 'testing' && reinforcementWord && (
          <ReinforcementCard
            key={`reinforce-${reinforcementWord.id}`}
            word={reinforcementWord}
            onContinue={() => {
              setReinforcementWord(null);
              setFeedback(null);
              const exercise = generateCumulativeExercise();
              setCurrentExercise(exercise);
            }}
          />
        )}
        
        {sessionState === 'testing' && currentExercise && !reinforcementWord && (
          <ExerciseCard
            key={`exercise-${currentExercise.word.id}`}
            exercise={currentExercise}
            onAnswer={handleExerciseAnswer}
            onComplete={handleExerciseComplete}
            feedback={feedback}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header Component with Cumulative Progress Indicators             */
/* ------------------------------------------------------------------ */

function StudyHeader({ lesson, introduced, total, mastered }) {
  const { t } = useTranslation();
  
  return (
    <GlassCard className="relative overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {t("card.lesson", { lesson })}
            </p>
            <WordBadge tone="violet">Learning</WordBadge>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Cumulative Progress
          </h2>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {introduced} / {total}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">introduced</p>
        </div>
      </div>
      
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
          initial={{ width: 0 }}
          animate={{ width: `${(introduced / total) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
      
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-slate-600 dark:text-slate-400">{mastered} mastered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-sky-400" />
          <span className="text-slate-600 dark:text-slate-400">{introduced - mastered} learning</span>
        </div>
      </div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Learning Card - Shows word for learning with mastery status          */
/* ------------------------------------------------------------------ */

function LearningCard({ word, mastery, onLearned, feedback, showSentenceMode, onToggleSentenceMode }) {
  const { i18n } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [word]);

  const handleReveal = () => {
    setRevealed(true);
    speakKorean(word.korean);
  };

  const handleContinue = () => {
    onLearned();
  };

  // Get mastery color
  const getMasteryColor = (mastery) => {
    if (!mastery) return 'bg-slate-200 dark:bg-slate-700';
    if (mastery.mastered) return 'bg-emerald-200 dark:bg-emerald-900';
    if (mastery.correctCount >= 2) return 'bg-sky-200 dark:bg-sky-900';
    return 'bg-violet-200 dark:bg-violet-900';
  };

  // Get word type based on category
  const getWordType = (category) => {
    if (category?.includes('countries')) return '🌍 Country';
    if (category?.includes('profession') || category?.includes('job')) return '👤 Profession';
    if (category?.includes('food')) return '🍽️ Food';
    if (category?.includes('family')) return '👨‍👩‍👧 Family';
    if (category?.includes('number')) return '🔢 Number';
    if (category?.includes('verb')) return '📝 Verb';
    if (category?.includes('adjective')) return '🎨 Adjective';
    return '📚 Noun';
  };

  // Generate example sentence with highlighted word
  const generateExampleSentence = (word) => {
    const sentences = {
      '독일': { ko: '저는 독일에서 왔습니다.', uz: 'Men Germaniyadan keldim.' },
      '미국': { ko: '그는 미국에 삽니다.', uz: 'U AQShda yashaydi.' },
      '영국': { ko: '영국은 유럽에 있습니다.', uz: 'Angliya Yevropada joylashgan.' },
      '일본': { ko: '일본 음식을 좋아합니다.', uz: 'Men Yaponiya taomlarini yaxshi ko\'raman.' },
      '중국': { ko: '중국은 인구가 많습니다.', uz: 'Xitoyda aholi ko\'p.' },
      '한국': { ko: '한국어를 공부합니다.', uz: 'Men koreys tilini o\'rganaman.' },
      '학생': { ko: '저는 학생입니다.', uz: 'Men o\'quvchiman.' },
      '선생님': { ko: '그는 선생님입니다.', uz: 'U o\'qituvchi.' },
      '의사': { ko: '그녀는 의사입니다.', uz: 'U shifokor.' },
      '경찰관': { ko: '그는 경찰관입니다.', uz: 'U politsiyachi.' },
    };

    const defaultSentence = {
      ko: `${word.korean}는 아주 중요한 단어입니다.`,
      uz: `${word.uzbek} - bu juda muhim so'z.`
    };

    return sentences[word.korean] || defaultSentence;
  };

  const exampleSentence = generateExampleSentence(word);

  return (
    <GlassCard className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-center"
      >
        {/* Mastery indicator */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${getMasteryColor(mastery)}`} />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {mastery?.mastered ? 'Mastered' : mastery?.correctCount > 0 ? `Progress: ${mastery.correctCount}/${MASTERY_THRESHOLD}` : 'New word'}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
            {i18n.language === 'uz' ? 'So\'zni o\'rganing' : 'Learn this word'}
          </p>
          <WordBadge tone="violet">{getWordType(word.category)}</WordBadge>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-5xl font-black text-slate-900 dark:text-white mb-2">
              {word.korean}
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              {word.romanization}
            </p>
          </div>

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {word.uzbek}
              </p>
              {word.english && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {word.english}
                </p>
              )}
              
              {/* Sentence Learning Mode */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onToggleSentenceMode}
                  className="mb-3 text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                >
                  {showSentenceMode 
                    ? (i18n.language === 'uz' ? 'Gapni yashirish' : 'Hide Sentence')
                    : (i18n.language === 'uz' ? 'Gapni ko\'rsatish' : 'Show Sentence')
                  }
                </button>
                
                {showSentenceMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
                  >
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      {i18n.language === 'uz' ? 'Misol' : 'Example'}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-sky-600 dark:text-sky-400">{word.korean}</span>{exampleSentence.ko.replace(word.korean, '')}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {exampleSentence.uz}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakKorean(exampleSentence.ko)}
                      className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      🔊 {i18n.language === 'uz' ? 'O\'qing' : 'Listen'}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {!revealed ? (
            <button
              type="button"
              onClick={handleReveal}
              className="rounded-2xl bg-slate-950 px-8 py-3 font-black text-white transition hover:scale-105 dark:bg-white dark:text-slate-950"
            >
              {i18n.language === 'uz' ? 'Ko\'rsatish' : 'Reveal'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="rounded-2xl bg-emerald-500 px-8 py-3 font-black text-white transition hover:scale-105"
            >
              {i18n.language === 'uz' ? 'Davom etish' : 'Continue'}
            </button>
          )}
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-4 text-lg font-bold ${
              feedback.type === 'success' ? 'text-emerald-500' : 'text-orange-500'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </motion.div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Reinforcement Card - Shows detailed word info after wrong answer    */
/* ------------------------------------------------------------------ */

function ReinforcementCard({ word, onContinue }) {
  const { i18n } = useTranslation();

  const handleContinueClick = () => {
    onContinue();
  };

  const exampleSentences = {
    '독일': { ko: '저는 독일에서 왔습니다.', uz: 'Men Germaniyadan keldim.' },
    '미국': { ko: '그는 미국에 삽니다.', uz: 'U AQShda yashaydi.' },
    '영국': { ko: '영국은 유럽에 있습니다.', uz: 'Angliya Yevropada joylashgan.' },
    '일본': { ko: '일본 음식을 좋아합니다.', uz: 'Men Yaponiya taomlarini yaxshi ko\'raman.' },
    '중국': { ko: '중국은 인구가 많습니다.', uz: 'Xitoyda aholi ko\'p.' },
    '한국': { ko: '한국어를 공부합니다.', uz: 'Men koreys tilini o\'rganaman.' },
    '학생': { ko: '저는 학생입니다.', uz: 'Men o\'quvchiman.' },
    '선생님': { ko: '그는 선생님입니다.', uz: 'U o\'qituvchi.' },
    '의사': { ko: '그녀는 의사입니다.', uz: 'U shifokor.' },
    '경찰관': { ko: '그는 경찰관입니다.', uz: 'U politsiyachi.' },
  };

  const defaultSentence = {
    ko: `${word.korean}는 아주 중요한 단어입니다.`,
    uz: `${word.uzbek} - bu juda muhim so'z.`
  };

  const example = exampleSentences[word.korean] || defaultSentence;

  return (
    <GlassCard className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="mb-6">
          <WordBadge tone="amber">Review</WordBadge>
          <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
            {i18n.language === 'uz' ? 'Keling, qayta ko\'rib chiqamiz' : 'Let\'s review this one'}
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-5xl font-black text-slate-900 dark:text-white mb-2">
              {word.korean}
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              {word.romanization}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {word.uzbek}
            </p>
            {word.english && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {word.english}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-sky-50 p-4 dark:bg-sky-900/20">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              {i18n.language === 'uz' ? 'Misol' : 'Example'}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
              {example.ko}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {example.uz}
            </p>
            <button
              type="button"
              onClick={() => speakKorean(example.ko)}
              className="mt-3 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              🔊 {i18n.language === 'uz' ? 'O\'qing' : 'Listen'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinueClick}
          className="mt-8 rounded-2xl bg-slate-950 px-8 py-3 font-black text-white transition hover:scale-105 dark:bg-white dark:text-slate-950"
        >
          {i18n.language === 'uz' ? 'Davom etish' : 'Continue'}
        </button>
      </motion.div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Checkpoint Screen - Announces cumulative testing phase              */
/* ------------------------------------------------------------------ */

function CheckpointScreen({ wordCount, masteredCount, onStart }) {
  const { i18n } = useTranslation();

  return (
    <GlassCard className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-sky-500 text-2xl"
          >
            ✓
          </motion.div>
        </div>

        <WordBadge tone="violet">Checkpoint</WordBadge>
        <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
          {i18n.language === 'uz' ? 'Tekshirish vaqti' : 'Time to Check'}
        </h2>
        
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          {i18n.language === 'uz' 
            ? `${wordCount} ta so\'z o\'rgandingiz. Endi ${masteredCount} tasini bilishingiz kerak.`
            : `You've learned ${wordCount} words. Now let's check your knowledge.`
          }
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-500">{masteredCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">mastered</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-sky-500">{wordCount - masteredCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">to practice</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-8 rounded-2xl bg-slate-950 px-8 py-3 font-black text-white transition hover:scale-105 dark:bg-white dark:text-slate-950"
        >
          {i18n.language === 'uz' ? 'Boshlash' : 'Start Practice'}
        </button>
      </motion.div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Exercise Card - Simplified cumulative testing                        */
/* ------------------------------------------------------------------ */

function ExerciseCard({ exercise, onAnswer, onComplete, feedback }) {
  const { i18n } = useTranslation();
  const [answered, setAnswered] = useState(false);

  // Reset answered state when exercise changes
  useEffect(() => {
    setAnswered(false);
  }, [exercise.word.id, exercise.type]);

  const handleAnswer = (selectedIndex) => {
    if (answered) return;
    setAnswered(true);
    const isCorrect = selectedIndex === exercise.correctIndex;
    onAnswer(isCorrect, exercise);
    setTimeout(() => onComplete(), 800);
  };

  // Route to appropriate exercise component based on type
  const renderExercise = () => {
    switch (exercise.type) {
      case 'koreanToUzbek':
        return <MultipleChoiceChallenge word={exercise.word} options={exercise.options} onAnswer={handleAnswer} answered={answered} />;
      case 'uzbekToKorean':
        return <ReverseChoiceChallenge word={exercise.word} options={exercise.options} onAnswer={handleAnswer} answered={answered} />;
      case 'listeningToKorean':
        return <ListeningChallenge word={exercise.word} options={exercise.options} onAnswer={handleAnswer} answered={answered} />;
      case 'trueFalse':
        return <TrueFalseChallenge word={exercise.word} options={exercise.options} onAnswer={handleAnswer} answered={answered} />;
      case 'missingSyllable':
        return <MissingLetterChallenge word={exercise.word} options={exercise.options} onAnswer={handleAnswer} answered={answered} />;
      case 'typingChallenge':
        return <TypingChallenge word={exercise.word} options={exercise.options} onAnswer={handleAnswer} answered={answered} />;
      case 'listeningToMeaning':
        return <ListeningToMeaningChallenge word={exercise.word} options={exercise.options} onAnswer={handleAnswer} answered={answered} />;
      case 'sentenceContext':
        return <SentenceContextChallenge word={exercise.word} options={exercise.options} onAnswer={handleAnswer} answered={answered} />;
      default:
        return <MultipleChoiceChallenge word={exercise.word} options={exercise.options} onAnswer={handleAnswer} answered={answered} />;
    }
  };

  return (
    <GlassCard className="mx-auto max-w-2xl">
      <motion.div
        key={exercise.word.id + exercise.type}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mb-6 text-center">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {i18n.language === 'uz' ? 'Amaliyot' : 'Practice'}
          </p>
          <WordBadge tone="violet">{exercise.type}</WordBadge>
        </div>

        {renderExercise()}

        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 text-center text-lg font-bold ${
              feedback.type === 'success' ? 'text-emerald-500' : 'text-orange-500'
            }`}
          >
            {feedback.message}
            {feedback.correctAnswer && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {feedback.correctAnswer.korean} = {feedback.correctAnswer.uzbek}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </GlassCard>
  );
}

// Exercise Registry - Maps exercise types to existing challenge components
const EXERCISE_REGISTRY = {
  koreanToUzbek: MultipleChoiceChallenge,
  uzbekToKorean: ReverseChoiceChallenge,
  listeningToKorean: ListeningChallenge,
  trueFalse: TrueFalseChallenge,
  missingSyllable: MissingLetterChallenge,
  typingChallenge: TypingChallenge,
  listeningToMeaning: ListeningToMeaningChallenge,
  sentenceContext: SentenceContextChallenge,
};

/* ------------------------------------------------------------------ */
/* Challenge Type Components                                           */
/* ------------------------------------------------------------------ */

function MultipleChoiceChallenge({ word, options, onAnswer, answered = false }) {
  const { i18n } = useTranslation();

  const handleSelect = (index) => {
    if (answered) return;
    onAnswer(index);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">
          {word.korean}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {i18n.language === 'uz' ? 'To\'g\'ri ma\'noni tanlang' : 'Choose the correct meaning'}
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={answered}
            className={`rounded-2xl border-2 p-4 text-left font-semibold transition-all ${
              answered
                ? 'opacity-50 cursor-not-allowed'
                : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20'
            }`}
          >
            <p className="text-lg text-slate-900 dark:text-white">{option.uzbek}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReverseChoiceChallenge({ word, options, onAnswer, answered = false }) {
  const { i18n } = useTranslation();

  const handleSelect = (index) => {
    if (answered) return;
    onAnswer(index);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {word.uzbek}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {i18n.language === 'uz' ? 'To\'g\'ri koreys so\'zini tanlang' : 'Choose the correct Korean word'}
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={answered}
            className={`rounded-2xl border-2 p-4 text-left font-semibold transition-all ${
              answered
                ? 'opacity-50 cursor-not-allowed'
                : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20'
            }`}
          >
            <p className="text-2xl text-slate-900 dark:text-white">{option.korean}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{option.romanization}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TrueFalseChallenge({ word, options, onAnswer, answered = false }) {
  const { i18n } = useTranslation();
  
  // Create a true/false scenario
  const isTrue = Math.random() > 0.5;
  const displayedOption = isTrue ? word : options[0];
  const correctAnswer = isTrue;

  const handleSelect = (isYes) => {
    if (answered) return;
    onAnswer(isYes === correctAnswer ? 0 : 1);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {displayedOption.korean} = {displayedOption.uzbek}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {i18n.language === 'uz' ? 'Bu tarjima to\'g\'rimi?' : 'Is this translation correct?'}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleSelect(true)}
          disabled={answered}
          className={`flex-1 rounded-2xl border-2 p-4 font-semibold transition-all ${
            answered
              ? 'opacity-50 cursor-not-allowed'
              : 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:hover:border-emerald-900/50'
          }`}
        >
          {i18n.language === 'uz' ? 'Ha, to\'g\'ri' : 'Yes, correct'}
        </button>
        <button
          type="button"
          onClick={() => handleSelect(false)}
          disabled={answered}
          className={`flex-1 rounded-2xl border-2 p-4 font-semibold transition-all ${
            answered
              ? 'opacity-50 cursor-not-allowed'
              : 'border-orange-200 bg-orange-50 hover:border-orange-300 hover:bg-orange-100 dark:border-orange-900/30 dark:bg-orange-900/20 dark:hover:border-orange-900/50'
          }`}
        >
          {i18n.language === 'uz' ? 'Yo\'q, noto\'g\'ri' : 'No, incorrect'}
        </button>
      </div>
    </div>
  );
}

function MissingLetterChallenge({ word, options, onAnswer, answered = false }) {
  const { i18n } = useTranslation();
  
  // Create missing letter scenario
  const romanization = word.romanization;
  const letters = romanization.split('');
  const missingIndex = Math.floor(Math.random() * letters.length);
  const beforeMissing = letters.slice(0, missingIndex).join('');
  const afterMissing = letters.slice(missingIndex + 1).join('');
  const missingLetter = letters[missingIndex];

  const letterOptions = [
    { id: 1, letter: missingLetter },
    { id: 2, letter: String.fromCharCode(97 + Math.floor(Math.random() * 26)) },
    { id: 3, letter: String.fromCharCode(97 + Math.floor(Math.random() * 26)) },
    { id: 4, letter: String.fromCharCode(97 + Math.floor(Math.random() * 26)) },
  ].sort(() => Math.random() - 0.5);

  const handleSelect = (index) => {
    if (answered) return;
    const correctIndex = letterOptions.findIndex(opt => opt.letter === missingLetter);
    onAnswer(index === correctIndex ? 0 : 1);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {beforeMissing}<span className="text-slate-400">□</span>{afterMissing}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {i18n.language === 'uz' ? 'Yetishmayotgan harfni tanlang' : 'Choose the missing letter'}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {letterOptions.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={answered}
            className={`aspect-square rounded-2xl border-2 p-4 text-center text-2xl font-bold transition-all ${
              answered
                ? 'opacity-50 cursor-not-allowed'
                : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20'
            }`}
          >
            {option.letter}
          </button>
        ))}
      </div>
    </div>
  );
}

function ListeningChallenge({ word, options, onAnswer, answered = false }) {
  const { i18n } = useTranslation();
  const [played, setPlayed] = useState(false);

  const handlePlay = () => {
    speakKorean(word.korean);
    setPlayed(true);
  };

  const handleSelect = (index) => {
    if (answered) return;
    onAnswer(index);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <button
          type="button"
          onClick={handlePlay}
          className="mb-4 rounded-full bg-slate-900 p-4 text-white transition hover:scale-110 dark:bg-white dark:text-slate-950"
        >
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {i18n.language === 'uz' ? 'Eshitib, to\'g\'ri so\'zni tanlang' : 'Listen and choose the correct word'}
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={answered || !played}
            className={`rounded-2xl border-2 p-4 text-left font-semibold transition-all ${
              answered || !played
                ? 'opacity-50 cursor-not-allowed'
                : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20'
            }`}
          >
            <p className="text-2xl text-slate-900 dark:text-white">{option.korean}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{option.romanization}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ListeningToMeaningChallenge({ word, options, onAnswer, answered = false }) {
  const { i18n } = useTranslation();
  const [played, setPlayed] = useState(false);

  const handlePlay = () => {
    speakKorean(word.korean);
    setPlayed(true);
  };

  const handleSelect = (index) => {
    if (answered) return;
    onAnswer(index);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <button
          type="button"
          onClick={handlePlay}
          className="mb-4 rounded-full bg-slate-900 p-4 text-white transition hover:scale-110 dark:bg-white dark:text-slate-950"
        >
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {i18n.language === 'uz' ? 'Eshitib, ma\'noni tanlang' : 'Listen and choose the meaning'}
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={answered || !played}
            className={`rounded-2xl border-2 p-4 text-left font-semibold transition-all ${
              answered || !played
                ? 'opacity-50 cursor-not-allowed'
                : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20'
            }`}
          >
            <p className="text-lg text-slate-900 dark:text-white">{option.uzbek}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SentenceContextChallenge({ word, options, onAnswer, answered = false }) {
  const { i18n } = useTranslation();
  
  // Generate sentence with target word highlighted
  const sentences = {
    '독일': { ko: '저는 **독일**에서 왔습니다.', uz: 'Men Germaniyadan keldim.' },
    '미국': { ko: '그는 **미국**에 삽니다.', uz: 'U AQShda yashaydi.' },
    '영국': { ko: '**영국**은 유럽에 있습니다.', uz: 'Angliya Yevropada joylashgan.' },
    '일본': { ko: '**일본** 음식을 좋아합니다.', uz: 'Men Yaponiya taomlarini yaxshi ko\'raman.' },
    '중국': { ko: '**중국**은 인구가 많습니다.', uz: 'Xitoyda aholi ko\'p.' },
    '한국': { ko: '**한국**어를 공부합니다.', uz: 'Men koreys tilini o\'rganaman.' },
    '학생': { ko: '저는 **학생**입니다.', uz: 'Men o\'quvchiman.' },
    '선생님': { ko: '그는 **선생님**입니다.', uz: 'U o\'qituvchi.' },
    '의사': { ko: '그녀는 **의사**입니다.', uz: 'U shifokor.' },
    '경찰관': { ko: '그는 **경찰관**입니다.', uz: 'U politsiyachi.' },
  };

  const defaultSentence = {
    ko: `이것은 **${word.korean}**입니다.`,
    uz: `Bu ${word.uzbek}.`
  };

  const sentence = sentences[word.korean] || defaultSentence;
  const sentenceWithBlank = sentence.ko.replace(/\*\*.*?\*\*/, '_____');

  const handleSelect = (index) => {
    if (answered) return;
    onAnswer(index);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          {i18n.language === 'uz' ? 'Gapdagi so\'zni tanlang' : 'Choose the word for the blank'}
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {sentenceWithBlank}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {sentence.uz}
        </p>
      </div>

      <div className="grid gap-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={answered}
            className={`rounded-2xl border-2 p-4 text-left font-semibold transition-all ${
              answered
                ? 'opacity-50 cursor-not-allowed'
                : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20'
            }`}
          >
            <p className="text-2xl text-slate-900 dark:text-white">{option.korean}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{option.romanization}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingChallenge({ word, options, onAnswer, answered = false }) {
  const { i18n } = useTranslation();
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (answered) return;
    
    // Allow partial matching
    const similarity = calculateSimilarity(input.toLowerCase(), word.korean.toLowerCase());
    const isCorrect = similarity >= 0.7;
    
    onAnswer(isCorrect ? 0 : 1);
  };

  const calculateSimilarity = (str1, str2) => {
    if (str1 === str2) return 1;
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {word.uzbek}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {i18n.language === 'uz' ? 'Koreys tilida yozing' : 'Type in Korean'}
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={answered}
          placeholder={word.korean}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white/70 p-4 text-center text-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white/30"
        />
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={answered || !input}
          className={`w-full rounded-2xl p-4 font-bold transition ${
            answered || !input
              ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
              : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
          }`}
        >
          {i18n.language === 'uz' ? 'Tekshirish' : 'Check'}
        </button>
      </div>

      {answered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-lg text-slate-900 dark:text-white">
            {word.korean}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {word.romanization}
          </p>
        </motion.div>
      )}
    </div>
  );
}
