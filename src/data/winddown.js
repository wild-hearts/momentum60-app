// Evening wind-down: one honest question a night, rotated by programme day.
// Carried over from Glow90's wind-down list, which was written in the Momentum voice.
// The answer is saved as that day's reflection, so it shows in the Momentum Book.
export const WINDDOWN_QUESTIONS = [
  "What did you do today that the old you would have skipped?",
  "Where did you tell the truth today, even the small version of it?",
  "What did you almost say, and then didn't?",
  "Who did you show up for today, including yourself?",
  "What cost you something today, and was it worth it?",
  "Where did you choose the harder, more honest option?",
  "What did you let go of today, even for an hour?",
  "Who did you disappoint today by choosing yourself instead?",
  "What's the one thing from today you don't want to forget?",
  "Did you stay when you wanted to leave, or leave when you wanted to stay?",
  "What have you been putting off for weeks that you finally did today?",
  "What did you say today that you'd have swallowed a month ago?",
  "What did you protect today, your time, your name, your peace?",
  "What did you do today that no one else saw?",
  "Where did you push past the part of you that wanted to quit?",
  "What did you ask for today, and what did you actually get?",
  "What's the smallest true thing you can say about today?",
  "Who saw the real version of you today?",
  "What did you refuse today?",
  "What did you do today that felt like yours, not anyone else's?",
  "What did today prove about you?",
  "Where did you show your work today instead of hiding it?",
  "What did today teach you about what you can carry?",
  "What did you choose today that you wouldn't have chosen a year ago?",
  "What's still unfinished from today, and does it need to be?",
  "When did you feel most like yourself today?",
  "What did you do today out of habit, and what did you do on purpose?",
  "What would you have to admit about today if you were being fully honest?",
  "What did you carry today that wasn't yours to carry?",
  "What would you tell the person who started this season?",
  "What did you replay tonight that you can't do anything about?",
  "Whose opinion did you spend energy on today, and did they earn it?",
  "What did you clear out today, from a drawer, a phone or a promise?",
  "What did you say yes to today that you'd rather not have?",
  "Which conversation did you leave alone today, and how did that feel?"
];

export const windDownFor = day => WINDDOWN_QUESTIONS[(Math.max(1, day) - 1) % WINDDOWN_QUESTIONS.length];
