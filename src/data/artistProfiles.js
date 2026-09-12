const profiles = {
  'luna vale': {
    tagline: 'Songs for the hours between dusk and dawn.',
    career: 'Luna Vale builds dream-pop songs around hushed vocals, slow-burning synths, and the feeling of a city after midnight.',
    personality: 'Introspective, quietly playful, and drawn to stories that leave room for the listener to wander.',
    colors: ['#32234f', '#bb6f9e', '#f3c19c'],
    songs: ['Velvet Skies', 'Starlit Drive', 'Slow Orbit', 'Glass Garden', 'Moonlit Letters'],
    albums: [['Velvet Skies EP', 2024], ['Slow Orbit', 2022], ['Glass Garden', 2020]],
    featuredAlbums: [['After Hours', 'The Violets', 2023], ['Soft Focus', 'Milo Sun', 2021]]
  },
  'the violets': {
    tagline: 'A little noise, a lot of feeling.',
    career: 'The Violets move between bright guitar hooks and late-night indie rock, making songs that feel as good in a crowd as they do alone.',
    personality: 'Restless, warm, and never afraid to turn a small moment into a chorus.',
    colors: ['#242b55', '#7561a9', '#d39cc3'],
    songs: ['After Hours', 'City Static', 'Paper Hearts', 'Silver Lines', 'Stay Awake'],
    albums: [['After Hours', 2023], ['City Static', 2021], ['Paper Hearts', 2019]],
    featuredAlbums: [['Velvet Skies EP', 'Luna Vale', 2024]]
  },
  'milo sun': {
    tagline: 'Open roads and softer landings.',
    career: 'Milo Sun writes alternative songs with sunlit guitars and unhurried rhythms, following the feeling of somewhere new just over the horizon.',
    personality: 'Easygoing and curious, with an ear for hopeful details in ordinary days.',
    colors: ['#22565c', '#69beba', '#d6df8d'],
    songs: ['Open Road', 'Soft Focus', 'Daylight', 'Tidepool', 'Somewhere New'],
    albums: [['Open Road', 2024], ['Soft Focus', 2021], ['Daylight', 2019]],
    featuredAlbums: [['Glass Garden', 'Luna Vale', 2020]]
  },
  'june harper': {
    tagline: 'Soulful stories with a golden edge.',
    career: 'June Harper pairs close-up storytelling with warm soul arrangements, turning memories into songs that linger long after the last note.',
    personality: 'Candid, generous, and happiest when a melody feels like a conversation.',
    colors: ['#6b304e', '#dc955e', '#e7c891'],
    songs: ['Gold Dust', 'Blue Motel', 'Almost Home', 'Sunday Light', 'Little Fires'],
    albums: [['Gold Dust', 2024], ['Almost Home', 2022], ['Sunday Light', 2020]],
    featuredAlbums: [['Open Road', 'Milo Sun', 2024]]
  }
};

export function getArtistProfile(name) {
  return profiles[name?.trim().toLowerCase()] || null;
}

export function getArtistColors(name, profile) {
  if (profile?.colors) return profile.colors;
  const palettes = [
    ['#2e345c', '#8d74bf', '#e4adbe'],
    ['#24556a', '#6cacc0', '#d9c08b'],
    ['#573753', '#bb7992', '#e6c184']
  ];
  const hash = [...(name || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
}
