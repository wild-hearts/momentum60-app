// The crisis check. Anything she writes that looks like a crisis gets the support card straight
// away. No model involved. Deliberately biased toward false positives: a missed signal is
// unacceptable, so "want to die" inside "I want to die my hair" is a tolerated false positive.
const CRISIS=/\b(kill myself|end(?:ing)? it|end(?:ing)? my life|suicide|self.?harm(?:ing)?|hurt(?:ing)? myself|harming myself|(?:not|don(?:['’])?t) want to be here|want to die|wish I (?:were|was) dead)\b/i;
export const crisisScan=text=>CRISIS.test(text||'');
