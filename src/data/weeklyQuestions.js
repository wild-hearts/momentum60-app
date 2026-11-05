// One bigger question a week, chosen by programme week (60 days is nine weeks).
// DRAFT WORDING for Naomi to review: taken from Glow90's weekly questions, with
// the mirror question dropped and the gendered lines made general.
export const WEEKLY_QUESTIONS = [
  "What did you stop asking for, and when did you stop?",
  "Who were you before everyone needed something from you?",
  "What are you tired of apologising for?",
  "Which part of your day actually belongs to you?",
  "What does your body keep telling you that you keep talking over?",
  "What are you saving for a better version of yourself?",
  "What's the anger underneath the tiredness?",
  "Where do you make yourself smaller than you are?",
  "What will you keep doing after day sixty, with nobody watching?"
];

export const WEEKLY_ANSWER_MAX = 4000;
export const weekOfDay = day => Math.min(9, Math.max(1, Math.ceil(day / 7)));
export const weeklyQuestionFor = week => WEEKLY_QUESTIONS[(Math.max(1, week) - 1) % WEEKLY_QUESTIONS.length];
