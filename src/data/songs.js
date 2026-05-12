// This array holds 60 Spotify Track IDs, one for each day of the challenge.
// To find a Track ID: Open Spotify, right-click a song -> Share -> Copy Song Link.
// A link looks like this: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
// The ID is the random text after "/track/": 4cOdK2wGLETKBW3PvgPWqT

// I have filled these with the Day 1 track for now. You can replace them with the actual 60 track IDs from "The Winks" as you go.
const PLACEHOLDER_ID = "5tsYOzDHNKmmsuPCnwnbKm"; 

export const dailySongs = [
  "5tsYOzDHNKmmsuPCnwnbKm", // Day 1
  "5WmSVAl88eO5yhMn4rDfMk", // Day 2
  "3AWnsk0WFiu7hyEnbnK2Fs", // Day 3
  "0NDhaRzGmlXMcACR80hqjV", // Day 4
  "05elIJBH1WEnf6azmY7lds", // Day 5
  "7AnheOTH7WsZGvIZ7gbfPW", // Day 6
  "3KqJb8TNubRQpLQeGXy2KE", // Day 7
  "2CDwrcTbzeHH3nb9T18dMz", // Day 8
  "3hikJmQrtd5dtDpEXVPvVM", // Day 9
  "4RN16d4LOSD4n0etHNQOUh", // Day 10
  "1V2w7DSWtqs5oqcP7uCLiP", // Day 11
  "5hyJiuBOLmpvsxHwBJS3QF", // Day 12
  "05IQ4M1YJFHX673w5KSA4k", // Day 13
  "5GnjW8BATPkkXa0BziCpuT", // Day 14
  "3y4Ln80zTypD1sXfkqrzKF", // Day 15
  "0RsbL2k4qh8jBdpWTdvfvA", // Day 16
  "2OUbiboMeTMhJglCXXtReL", // Day 17
  "62cv9wPkqTG8gu46pXo7xJ", // Day 18
  "4kFbUt8U5IL1HSmHhoytXt", // Day 19
  "7hsOgM45TNaWRaQV7nR5xf", // Day 20
  "3xVmrR7jrLCoQ0R4OKPU5S", // Day 21
  "7FxgmaO0rd91kek3wceoiF", // Day 22
  "1oE85sFvyhpbzGTHIwgLdf", // Day 23
  "7wn6CTaBPBId6Rv9Ztqf8L", // Day 24
  "502OM7CMsXS3blWEWtEqxF", // Day 25
  "1YWxcOyRqwC5mDs0kWX5Ft", // Day 26
  "1rWq654fNtajKzUcAxJSVQ", // Day 27
  "75hj1Lery6HKmwqo5Q19QN", // Day 28
  "0Os101iAiuNVWaXjYFpF4S", // Day 29
  "7L5xrS8jxo4eGuSLkIrfRN", // Day 30
  "1UJdiU12sya29xPbjXrbdM", // Day 31
  "4qXxySjoxgdbyxqKyGpXpj", // Day 32
  "3PLCX0GqVa1xQYfOWhmRmg", // Day 33
  "06WGGXsCKk9qd7jY67neQh", // Day 34
  "1iAJGTpNOpuOIEgXhYskPL", // Day 35
  "4iBrJgw9ysbGLYxctBQEJ1", // Day 36
  "1UEso9Uthc63IlYZpAB1O8", // Day 37
  "1ebLBqI8O9JbWBvHT22hYs", // Day 38
  "4hoqiMZfFQzSzlYxnAnH6g", // Day 39
  "1tqUsmhEyINLVxtoYdJIDO", // Day 40
  "0l8LqZa1a1ZC0R3lqmI2aM", // Day 41
  "02dstEsK66TD3pYiX49E1P", // Day 42
  "1Abh2HGMTua7mQHZbBFrbl", // Day 43
  "07NXmwmZBwU0Tc20otGebZ", // Day 44
  "0YywsEIh0L9ZyL6VWJ6a0x", // Day 45
  "7cZ79tGSMzpEgyawQEOtTb", // Day 46
  "43R7kl42M4Sx5h5TJjuKGt", // Day 47
  "0tT5UpWYn4smxZd8r9BiHM", // Day 48
  "6pr3eTothnJHm15k17V0gT", // Day 49
  "7vAoz62x6QK2SKXTO6wnhz", // Day 50
  "7BqNtiu6kOeMyhod34FzaC", // Day 51
  "7n1kDnMd3wJhTHlb7kfotR", // Day 52
  "1n25ShUKNIkwEBPBSinCAu", // Day 53
  "0nxKboRX4bSu6vxx72zIA6", // Day 54
  "1hKlCug3FT0qt9unQMkWqo", // Day 55
  "3oB1S083qnXaqsRlKm1dGs", // Day 56
  ...Array(4).fill(PLACEHOLDER_ID)
];

// Example of how you would fill it out:
/*
export const dailySongs = [
  "1x...", // Day 1
  "2y...", // Day 2
  "3z...", // Day 3
  ...
];
*/
