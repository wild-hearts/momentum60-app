// This array holds 60 Spotify Track IDs, one for each day of the challenge.
// To find a Track ID: Open Spotify, right-click a song -> Share -> Copy Song Link.
// A link looks like this: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
// The ID is the random text after "/track/": 4cOdK2wGLETKBW3PvgPWqT

// I have filled these with the Day 1 track for now. You can replace them with the actual 60 track IDs from "The Winks" as you go.
const PLACEHOLDER_ID = "5tsYOzDHNKmmsuPCnwnbKm"; 

export const dailySongs = Array.from({ length: 60 }, (_, i) => PLACEHOLDER_ID);

// Example of how you would fill it out:
/*
export const dailySongs = [
  "1x...", // Day 1
  "2y...", // Day 2
  "3z...", // Day 3
  ...
];
*/
