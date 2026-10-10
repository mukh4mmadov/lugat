# TOPIK I Testing Prompt for AI

## Context
You are testing the TOPIK I practice section of a Korean vocabulary learning platform (K-TALIM). The app is running at http://localhost:5173. 

## Testing Instructions

### 1. Test Navigation & UI
- Navigate to the TOPIK I section
- Check the home page displays correctly with all three variants:
  - 35th Mock Exam (100-minute timer)
  - 35th Listening (no time limit)
  - 35th Reading (no time limit)
- Verify all labels are translated correctly in English, Uzbek, and Russian
- Check the "Recent attempts" section displays properly

### 2. Test Each Variant Individually

#### A. 35th Mock Exam
- Click "Start test" or resume an existing attempt
- Verify the 100-minute timer displays correctly
- Navigate through all 70 questions (30 Listening + 40 Reading)
- For Listening questions (1-30):
  - Verify the audio player is visible and functional
  - Test audio playback
  - Verify the PDF shows the correct page for each question
- For Reading questions (31-70):
  - Verify the PDF shows the correct page
  - Check question text and options display correctly
- Select answers for several questions
- Navigate using Previous/Next buttons
- Test the question number grid navigation
- Verify answers are saved (refresh page and check)
- Test the "Submit test" button
- Check the result page displays:
  - Listening score
  - Reading score
  - Total score
  - Estimated level
  - Elapsed time
- Review answers section - verify correct/incorrect indicators
- Test opening original paper pages

#### B. 35th Listening
- Start or resume a Listening attempt
- Verify only 30 Listening questions are shown (filtered correctly)
- Verify no time limit message
- Test audio playback for all listening questions
- Verify PDF displays correct pages
- Select answers and verify they save
- Submit and check results show only Listening score

#### C. 35th Reading
- Start or resume a Reading attempt
- Verify only 40 Reading questions are shown (filtered correctly)
- Verify no time limit message
- Test PDF displays correct pages for all questions
- Select answers and verify they save
- Submit and check results show only Reading score

### 3. Test Expired Attempt Handling
- Create a Mock attempt and let it exceed 100 minutes
- Try to resume it
- Verify it shows the expired state (not auto-submitted)
- Check you can choose to submit or cancel
- Verify the elapsed time is displayed correctly

### 4. Test PDF Loading
- Check PDF iframe loads correctly on all questions
- Test the "Open original paper" link works
- Verify PDF is cached and loads quickly on subsequent views
- Test PDF loading error handling (simulate network issues if possible)

### 5. Test Audio Loading
- Verify listening.mp3 file loads and plays
- Test audio controls (play, pause, seek)
- Check audio is cached for faster playback

### 6. Test Dark/Light Theme
- Switch between dark and light themes
- Verify all TOPIK pages look good in both themes:
  - Home page
  - Test attempt page
  - Result page
  - Question navigation
  - Answer review
- Check text contrast is readable
- Verify PDF and audio player styling

### 7. Test Responsive Design
- Test on different screen sizes (mobile, tablet, desktop)
- Verify the question grid navigation works on mobile
- Check PDF iframe scales correctly
- Test audio player on mobile

### 8. Test Error States
- Test loading states (show "Yuklanmoqda..." properly)
- Test network error handling (disconnect network if possible)
- Verify error messages are user-friendly
- Test retry buttons work

### 9. Test Answer Saving
- Select an answer and verify it's highlighted
- Refresh page and verify answer persists
- Check that unsaved answers don't persist after refresh
- Test changing answers

### 10. Accessibility
- Test keyboard navigation
- Verify screen reader labels are present
- Check ARIA attributes on interactive elements
- Test with keyboard only (no mouse)

## Issues to Document

For each issue found, provide:
1. **Issue Description**: What exactly is wrong
2. **Steps to Reproduce**: How to trigger the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Severity**: Critical / High / Medium / Low
6. **Screenshot/Video**: If applicable
7. **Browser Info**: Browser and version

## User Experience Improvements to Suggest

Suggest improvements for:
- Navigation flow
- Timer visibility and urgency
- Question layout
- Answer selection UX
- Result presentation
- Progress indication
- Any other UX concerns

## Recommendations

After testing, provide:
1. **Working Features**: List of features that work correctly
2. **Broken Features**: List of features that don't work
3. **Improvements Needed**: Specific improvements with priorities
4. **Features to Remove**: Any features that should be removed
5. **Features to Add**: New features that would enhance UX
6. **Theme Issues**: Any theme-specific issues (dark/light)
7. **Overall Assessment**: General quality assessment

## Testing Checklist

- [ ] Home page loads and displays correctly
- [ ] All three variants visible and clickable
- [ ] Mock exam starts and timer works
- [ ] All 70 questions accessible in Mock
- [ ] Listening questions (1-30) show audio player
- [ ] Audio plays correctly
- [ ] PDF loads and shows correct pages
- [ ] Reading questions (31-70) display correctly
- [ ] Answer selection works and persists
- [ ] Navigation (Prev/Next/Grid) works
- [ ] Submit functionality works
- [ ] Results page displays correctly
- [ ] Listening-only variant works
- [ ] Reading-only variant works
- [ ] Section filtering works correctly
- [ ] Expired attempt handling works
- [ ] PDF error handling works
- [ ] Dark theme looks good
- [ ] Light theme looks good
- [ ] Mobile responsive
- [ ] Error states handled properly
- [ ] Answer saving works
- [ ] Accessibility features work

## Output Format

Provide your findings in a structured markdown report with:
1. **Executive Summary** (3-5 sentences)
2. **Test Results** (pass/fail for each test)
3. **Issues Found** (detailed description of each issue)
4. **UX Recommendations** (prioritized list)
5. **Theme Compatibility** (dark/light issues)
6. **Conclusion** (overall assessment and next steps)
