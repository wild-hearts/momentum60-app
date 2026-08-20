// 60 daily anthem songs, one per challenge day.
// Files live in public/songs/dayNN.mp3 - served by the website and STREAMED
// (never bundled) by the native app. See SONGS_BASE_URL below.

// The native iOS/Android app streams from the production site; the website uses same-origin paths.
export const SONGS_BASE_URL = window.Capacitor?.isNativePlatform?.()
  ? 'https://challenge.themomentumrule.com/songs'
  : '/songs';

export const dailySongs = [
  { file: 'day01.mp3', title: 'Today Is My Day' }, // Day 1
  { file: 'day02.mp3', title: 'I Choose Today' }, // Day 2
  { file: 'day03.mp3', title: 'Grateful For This Moment' }, // Day 3
  { file: 'day04.mp3', title: 'Energy Flows Through Me' }, // Day 4
  { file: 'day05.mp3', title: 'Nothing Can Stop Me' }, // Day 5
  { file: 'day06.mp3', title: 'I Am Capable' }, // Day 6
  { file: 'day07.mp3', title: 'My Mind Is Powerful' }, // Day 7
  { file: 'day08.mp3', title: 'Confidence Is My Choice' }, // Day 8
  { file: 'day09.mp3', title: 'The Best Is Coming' }, // Day 9
  { file: 'day10.mp3', title: 'I Am Becoming' }, // Day 10
  { file: 'day11.mp3', title: 'I Deserve Good Things' }, // Day 11
  { file: 'day12.mp3', title: 'I Release The Past' }, // Day 12
  { file: 'day13.mp3', title: 'I Am Worthy' }, // Day 13
  { file: 'day14.mp3', title: 'My New Beginning' }, // Day 14
  { file: 'day15.mp3', title: 'I Choose Happiness' }, // Day 15
  { file: 'day16.mp3', title: 'I Control My Thoughts' }, // Day 16
  { file: 'day17.mp3', title: 'I Am Focused' }, // Day 17
  { file: 'day18.mp3', title: 'Discipline Creates Freedom' }, // Day 18
  { file: 'day19.mp3', title: 'I Keep My Promises To Myself' }, // Day 19
  { file: 'day20.mp3', title: 'I Trust Myself' }, // Day 20
  { file: 'day21.mp3', title: 'I Am Resilient' }, // Day 21
  { file: 'day22.mp3', title: 'Challenges Make Me Stronger' }, // Day 22
  { file: 'day23.mp3', title: 'I Have Nothing To Prove' }, // Day 23
  { file: 'day24.mp3', title: 'I Am Calm Under Pressure' }, // Day 24
  { file: 'day25.mp3', title: 'I Choose Courage' }, // Day 25
  { file: 'day26.mp3', title: 'I Am A Problem Solver' }, // Day 26
  { file: 'day27.mp3', title: 'I Take Action' }, // Day 27
  { file: 'day28.mp3', title: 'I Believe In My Decisions' }, // Day 28
  { file: 'day29.mp3', title: 'I Am Creating My Future' }, // Day 29
  { file: 'day30.mp3', title: 'My Possibilities Are Endless' }, // Day 30
  { file: 'day31.mp3', title: 'I Celebrate My Journey' }, // Day 31
  { file: 'day32.mp3', title: 'I Own My Voice' }, // Day 32
  { file: 'day33.mp3', title: 'I Am Fearless' }, // Day 33
  { file: 'day34.mp3', title: 'I Take Up Space' }, // Day 34
  { file: 'day35.mp3', title: 'I Trust My Instincts' }, // Day 35
  { file: 'day36.mp3', title: 'I Am A Leader' }, // Day 36
  { file: 'day37.mp3', title: 'I Am Brave' }, // Day 37
  { file: 'day38.mp3', title: 'I Speak With Confidence' }, // Day 38
  { file: 'day39.mp3', title: 'I Set Healthy Boundaries' }, // Day 39
  { file: 'day40.mp3', title: 'I Respect Myself' }, // Day 40
  { file: 'day41.mp3', title: 'I Am Unstoppable' }, // Day 41
  { file: 'day42.mp3', title: 'I Am Limitless' }, // Day 42
  { file: 'day43.mp3', title: 'I Believe In My Dreams' }, // Day 43
  { file: 'day44.mp3', title: 'I Am Proud Of Myself' }, // Day 44
  { file: 'day45.mp3', title: 'I Am Building My Dreams' }, // Day 45
  { file: 'day46.mp3', title: 'My Future Is Bright' }, // Day 46
  { file: 'day47.mp3', title: 'I Achieve My Goals' }, // Day 47
  { file: 'day48.mp3', title: 'I Celebrate My Wins' }, // Day 48
  { file: 'day49.mp3', title: 'I Am Living My Potential' }, // Day 49
  { file: 'day50.mp3', title: 'I Am The Person I Was Waiting For' }, // Day 50
  { file: 'day51.mp3', title: 'I Live With Purpose' }, // Day 51
  { file: 'day52.mp3', title: 'I Trust My Journey' }, // Day 52
  { file: 'day53.mp3', title: 'I Am Aligned' }, // Day 53
  { file: 'day54.mp3', title: 'I Create My Reality' }, // Day 54
  { file: 'day55.mp3', title: 'I Lead With Love' }, // Day 55
  { file: 'day56.mp3', title: 'I Inspire Others' }, // Day 56
  { file: 'day57.mp3', title: 'I Leave A Legacy' }, // Day 57
  { file: 'day58.mp3', title: 'I Am Proud Of My Story' }, // Day 58
  { file: 'day59.mp3', title: 'I Am Exactly Where I Need To Be' }, // Day 59
  { file: 'day60.mp3', title: 'The Best Version Of Me' }, // Day 60
];
