import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

const fadeConfig = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1],
};

export default function LanguageSelector({ onShowIELTSModal }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem('language') || 'uz'
  );
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find(lang => lang.code === selectedLang) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    if (langCode === selectedLang) {
      setIsOpen(false);
      return;
    }
    
    const previousLang = selectedLang;
    setIsChanging(true);
    setSelectedLang(langCode);
    
    // Change language at the right moment (during scale animation)
    setTimeout(() => {
      i18n.changeLanguage(langCode);
      localStorage.setItem('language', langCode);
      
      // Check if we should show IELTS recommendation
      // Show every time when switching FROM English TO Uzbek or Russian
      if (previousLang === 'en' && (langCode === 'uz' || langCode === 'ru')) {
        // Show modal immediately after language transition completes
        setTimeout(() => {
          console.log('Calling onShowIELTSModal'); // Debug
          onShowIELTSModal();
        }, 600); // Matches the dropdown close animation duration
      }
    }, 200);
    
    // Close dropdown after animation
    setTimeout(() => {
      setIsOpen(false);
      setIsChanging(false);
    }, 600);
  };

  const toggleOpen = () => {
    if (!isChanging) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        type="button"
        onClick={toggleOpen}
        className="relative flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/70 px-4 py-2 font-bold text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300/60 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:border-white/20"
        animate={{
          scale: isOpen ? 1.02 : 1,
          boxShadow: isOpen 
            ? "0 4px 20px rgba(0, 0, 0, 0.1)" 
            : "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}
        transition={springConfig}
      >
        <motion.span
          className="text-xl"
          animate={{
            opacity: isChanging ? 0.5 : 1,
            scale: isChanging ? 0.8 : 1
          }}
          transition={fadeConfig}
        >
          {currentLang.flag}
        </motion.span>
        <motion.span
          className="hidden sm:inline"
          animate={{
            opacity: isChanging ? 0.5 : 1,
            y: isChanging ? -4 : 0
          }}
          transition={fadeConfig}
        >
          {currentLang.name}
        </motion.span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-slate-400"
        >
          ▼
        </motion.span>
        
        {/* Subtle glow effect when open */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-full bg-sky-400/20 blur-xl"
            />
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={springConfig}
             className="absolute left-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 z-50 md:left-auto md:right-0"
            style={{
              boxShadow: "0 8px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)"
            }}
          >
            <div className="p-2 space-y-1">
              {languages.map((lang, index) => (
                <motion.button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isChanging}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    ...springConfig,
                    delay: index * 0.05
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    x: 2
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition-all ${
                    selectedLang === lang.code
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/25'
                      : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-sky-400/10"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  
                  <motion.span
                    className="text-xl relative z-10"
                    animate={{
                      scale: selectedLang === lang.code && isChanging ? 1.2 : 1
                    }}
                    transition={springConfig}
                  >
                    {lang.flag}
                  </motion.span>
                  <motion.span
                    className="relative z-10"
                    animate={{
                      opacity: isChanging && selectedLang !== lang.code ? 0.3 : 1
                    }}
                    transition={fadeConfig}
                  >
                    {lang.name}
                  </motion.span>
                  
                  {/* Active indicator */}
                  {selectedLang === lang.code && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={springConfig}
                      className="ml-auto relative z-10"
                    >
                      <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    </motion.div>
                  )}
                  
                  {/* Selection ripple effect */}
                  {selectedLang === lang.code && isChanging && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-white/30"
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ 
                        scale: 2, 
                        opacity: 0 
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}