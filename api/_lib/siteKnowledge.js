// What the feedback assistant knows about K-TALIM. Keep it in step with the
// app: prices with src/lib/premium.js, AI limits with api/ai-chat.js.

export const SITE_KNOWLEDGE = `
K-TALIM (https://lugat-six.vercel.app) is a website for Uzbek speakers learning Korean vocabulary and preparing for TOPIK I. The interface is in Uzbek, English and Russian (switch in the header menu). It has light and dark themes.

ACCOUNTS
- Sign up with email and password, or sign in with Google.
- After email sign-up a confirmation link is emailed. The account works only after opening it. No email: check the Spam folder; the "send again" button works after 60 seconds. An expired or used link: just try signing in, or request a new link from the sign-in page.
- Forgot password: "Forgot password?" on the sign-in page sends a reset link (also check Spam).
- Settings (/settings): change name, password, speech speed, auto-play pronunciation, export progress, reset progress, delete the account (permanent, cannot be undone).
- Progress is saved on the device and synced to the account when signed in, so it follows the learner to other devices. Without an account progress stays only in that browser.

LEARNING
- Two books, K-TALIM 1A and 1B: 28 lessons, 833 words. Every word has an Uzbek, English and Russian meaning, romanization and a short example sentence.
- Per lesson: Study, Flashcards, Listening, Quiz, Writing and Dictation (hear the example sentence, type it; a slower replay button exists).
- Review (/review) brings back words that are due (spaced repetition). Also Difficult words, Weak words, Favorites (★), Search (searches all three languages and romanization, tolerates small typos), Stats.
- Home has a Today card: daily goal (10/20/40/60 answers, changeable), last 7 days, a warning when the streak would end tonight, and a Continue button.
- Leaderboard (/leaderboard): weekly answers and all-time mastered words. Learners can hide themselves from it there.
- Phones have a bottom tab bar (Home, Study, Review, TOPIK, Menu). The site can be installed as an app from the browser menu ("Install app" / "Add to Home Screen").
- Pronunciation uses the device's Korean voice. No sound means the device has no Korean voice. Settings shows the voice status and a test button. To install one:
  Android: Settings → System → Languages → Text-to-speech → Speech Services by Google → ⚙ → Install voice data → Korean, then reload.
  iPhone: Settings → Accessibility → Spoken Content → Voices → Korean → download a voice, then reload.
  Windows: Settings → Time & language → Speech → Add voices → Korean, then restart the browser.
  Mac: System Settings → Accessibility → Spoken Content → System voice → Manage voices → Korean, then restart the browser.
  Otherwise: open the site in Chrome.

TOPIK I
- The 35th TOPIK I paper with real audio: full mock exam (100 minutes, listening then reading, like the computer-based IBT test), listening only, reading only (no time limit). Answers are saved while testing; the result shows the score, every answer, and listening transcripts ("Audio text").
- A vocabulary page for the 35th paper (/topik/words/...).
- AI explanation of TOPIK mistakes on the result page: free accounts get 1 explanation per result (up to 3 a day), Premium explains 10 at a time.
- More TOPIK papers will be added; we can't promise dates.

SPEAKING (/speaking, "Gaplashish" in the menu and the phone tab bar)
- Voice conversation in Korean with Hana, the AI partner: tap the microphone, say something in Korean, tap again to send. Hana answers in Korean (with a translation), corrects mistakes and asks the next question. Needs an account and microphone permission (allow it from the 🔒 icon in the address bar if it was blocked).
- Topics tab: a wheel of 45 conversation topics in three levels (beginner, intermediate, advanced), each with 3 questions and useful words.
- Free accounts get 10 minutes of speaking a day (resets at midnight Tashkent time). Premium is unlimited and adds pronunciation feedback.
- Before the first conversation the learner picks gender and level; both can be changed in the Profile tab.
- Talking with real people and invite rewards are coming soon (not available yet).

AI TUTOR (chat button in the corner)
- Guests: 2 questions a day. Free accounts: 10 questions a day (counted per account and per device). Premium: practically unlimited. The limit resets 24 hours later.

PREMIUM (/premium)
- Prices: 1 month 29 000 UZS, 3 months 69 000 UZS, 12 months 199 000 UZS.
- Gives now: practically unlimited AI tutor, unlimited speaking with pronunciation feedback, and AI explanation of every TOPIK mistake. Coming soon to Premium: more TOPIK papers and advanced statistics. All lessons and the 35th TOPIK paper stay free.
- How to buy: open /premium, pick a plan, press the Telegram button. It opens a chat with @mukh4mmadov with the order and account email filled in. Payment details are given there. Premium is usually turned on within an hour; a ⭐ appears next to the name. If it doesn't appear: sign out and back in, or reload.
- Payment, refunds and premium activation problems are handled only by the owner in Telegram: @mukh4mmadov.

FEEDBACK
- Reports are answered in this conversation; a red badge in the menu shows new replies. A learner can reply, mark the report solved, and rate the help.
`.trim();
