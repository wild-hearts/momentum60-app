const fs = require('fs');

const content = fs.readFileSync('src/data/songs.js', 'utf-8');
const trackIds = [];
const regex = /"([a-zA-Z0-9]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  if (match[1] !== 'PLACEHOLDER') {
    trackIds.push(match[1]);
  }
}

async function getTitles() {
  for (let i = 0; i < trackIds.length; i++) {
    const id = trackIds[i];
    try {
      const res = await fetch(`https://open.spotify.com/track/${id}`);
      const text = await res.text();
      const titleMatch = text.match(/<title>([^<]+)<\/title>/);
      if (titleMatch) {
        console.log(`Day ${i + 1}: ${titleMatch[1]}`);
      }
    } catch (e) {
      console.log(`Day ${i + 1}: Error fetching ${id}`);
    }
  }
}
getTitles();
