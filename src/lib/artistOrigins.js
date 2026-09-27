const cache = new Map();
let queue = Promise.resolve();
let lastRequest = 0;

async function readJson(url, headers = {}) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Artist location service is unavailable. Please try again.');
  return response.json();
}

function musicBrainz(path) {
  if (cache.has(path)) return Promise.resolve(cache.get(path));
  const request = queue.then(async () => {
    await new Promise(resolve => setTimeout(resolve, Math.max(0, 1100 - (Date.now() - lastRequest))));
    lastRequest = Date.now();
    const data = await readJson(`https://musicbrainz.org/ws/2/${path}`, {
      'Accept': 'application/json',
      'User-Agent': 'NewMusiq/1.0 (artist origin map)',
    });
    cache.set(path, data);
    return data;
  });
  queue = request.catch(() => {});
  return request;
}

export async function searchArtistOrigins(query) {
  const name = query.trim().replace(/[+\-!(){}\[\]^"~*?:\\/&|]/g, ' ').trim();
  if (!name) return [];
  const data = await musicBrainz(`artist/?query=${encodeURIComponent(`artist:"${name}"`)}&limit=10&fmt=json`);
  return (data.artists || []).map(artist => ({
    id: artist.id, name: artist.name, type: artist.type,
    description: artist.disambiguation || '', country: artist.country,
    origin: artist['begin-area'] || null,
  }));
}

export async function locateArtistOrigin(artist) {
  if (!artist.origin?.id) throw new Error('No hometown or place of origin is recorded for this artist.');
  const key = `coordinates:${artist.origin.id}`;
  if (cache.has(key)) return cache.get(key);
  const area = await musicBrainz(`area/${encodeURIComponent(artist.origin.id)}?inc=url-rels&fmt=json`);
  const link = area.relations?.find(relation => relation.type === 'wikidata')?.url?.resource;
  const entityId = link?.match(/\/Q(\d+)\/?$/)?.[1];
  if (!entityId) throw new Error('This origin is known, but its map coordinates are unavailable.');
  const id = `Q${entityId}`;
  const data = await readJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${id}&props=claims&format=json&origin=*`);
  const coordinates = data.entities?.[id]?.claims?.P625
    ?.filter(claim => claim.rank !== 'deprecated')
    .sort((a, b) => Number(b.rank === 'preferred') - Number(a.rank === 'preferred'))
    .map(claim => claim.mainsnak?.datavalue?.value)
    .find(value => value?.globe === 'http://www.wikidata.org/entity/Q2'
      && Number.isFinite(value.latitude) && Math.abs(value.latitude) <= 85.05112878
      && Number.isFinite(value.longitude) && Math.abs(value.longitude) <= 180);
  if (!coordinates) throw new Error('This origin is known, but its map coordinates are unavailable.');
  const point = [coordinates.latitude, coordinates.longitude];
  cache.set(key, point);
  return point;
}
