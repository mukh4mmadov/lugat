const EmptyStateIllustrations = {
  Chat: ({ className }) => (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="30" width="120" height="90" rx="20" stroke="#38bdf8" strokeWidth="4" fill="#38bdf8" fillOpacity="0.08" />
      <path d="M48 90 L68 110 L112 66" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="52" cy="58" r="6" fill="#38bdf8" fillOpacity="0.5" />
      <circle cx="80" cy="58" r="6" fill="#38bdf8" fillOpacity="0.5" />
      <circle cx="108" cy="58" r="6" fill="#38bdf8" fillOpacity="0.5" />
    </svg>
  ),

  WeakWords: ({ className }) => (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="80" cy="80" r="50" stroke="#a78bfa" strokeWidth="4" fill="#a78bfa" fillOpacity="0.08" />
      <circle cx="80" cy="80" r="32" stroke="#a78bfa" strokeWidth="4" fill="none" />
      <circle cx="80" cy="80" r="14" stroke="#a78bfa" strokeWidth="4" fill="none" />
      <circle cx="80" cy="80" r="5" fill="#a78bfa" />
      <path d="M80 30V46M80 114V130M30 80H46M114 80H130" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),

  ReviewCaughtUp: ({ className }) => (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="25" width="110" height="110" rx="24" stroke="#34d399" strokeWidth="4" fill="#34d399" fillOpacity="0.08" />
      <path d="M48 82L68 102L112 58" stroke="#34d399" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  NoDifficultWords: ({ className }) => (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M80 35L120 50V110C120 131 102 148 80 155C58 148 40 131 40 110V50L80 35Z" stroke="#fbbf24" strokeWidth="4" fill="#fbbf24" fillOpacity="0.08" />
      <path d="M60 80L72 92L100 64" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  SearchNoResults: ({ className }) => (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="68" cy="68" r="28" stroke="#94a3b8" strokeWidth="4" fill="#94a3b8" fillOpacity="0.08" />
      <path d="M95 95L125 125" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
      <path d="M125 95L95 125" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),

  FavoritesEmpty: ({ className }) => (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M80 130L30 60C20 45 35 25 55 35L80 55L105 35C125 25 140 45 130 60L80 130Z" stroke="#fb7185" strokeWidth="4" fill="#fb7185" fillOpacity="0.08" />
    </svg>
  ),

  DifficultEmpty: ({ className }) => (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M80 35L145 130H15L80 35Z" stroke="#fbbf24" strokeWidth="4" fill="#fbbf24" fillOpacity="0.08" />
      <path d="M80 70V95" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
      <circle cx="80" cy="115" r="6" fill="#fbbf24" />
    </svg>
  ),

  NoActivity: ({ className }) => (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="90" width="20" height="40" rx="4" fill="#38bdf8" fillOpacity="0.3" />
      <rect x="55" y="70" width="20" height="60" rx="4" fill="#38bdf8" fillOpacity="0.5" />
      <rect x="85" y="100" width="20" height="30" rx="4" fill="#38bdf8" fillOpacity="0.3" />
      <rect x="115" y="80" width="20" height="50" rx="4" fill="#38bdf8" fillOpacity="0.5" />
      <path d="M25 130H135" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),

  WelcomeNewUser: ({ className }) => (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="80" cy="80" r="50" stroke="#38bdf8" strokeWidth="4" fill="#38bdf8" fillOpacity="0.08" />
      <path d="M80 45V85M80 95V105" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
      <circle cx="80" cy="115" r="6" fill="#38bdf8" />
      <path d="M55 55L65 65M105 55L95 65" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
};

export default EmptyStateIllustrations;
