export function progressSummary(data, rules, today) {
  const completed = day => rules.some(rule => data[day]?.[rule.id] === true || data[day]?.[rule.id] === 'true');
  const perfect = day => rules.length > 0 && rules.every(rule => data[day]?.[rule.id] === true || data[day]?.[rule.id] === 'true');
  let actionDays = 0, streak = 0, best = 0, earnedPasses = 0;
  for (let day = 1; day <= Math.min(today, 60); day++) {
    if (completed(day)) actionDays++;
    if (perfect(day)) {
      streak++;
      best = Math.max(best, streak);
      if (streak % 10 === 0) earnedPasses++;
    } else if (day < today || completed(day)) streak = 0;
  }
  // Preserve old reward qualification without counting passes as real actions.
  let legacyRewardDays = 0, legacyStreak = 0, legacyPasses = 0;
  for (let day = 1; day <= Math.min(today, 60); day++) {
    if (perfect(day)) {
      legacyRewardDays++; legacyStreak++;
      if (legacyStreak % 10 === 0) legacyPasses++;
    } else if (completed(day)) { legacyRewardDays++; legacyStreak = 0; }
    else {
      legacyStreak = 0;
      if (day < today) {
        if (legacyPasses > 0) { legacyPasses--; legacyRewardDays++; }
        else break;
      }
    }
  }
  return { legacyRewardDays, actionDays, streak, best, earnedPasses, returning: today > 1 && !completed(today - 1) && !completed(today) };
}
