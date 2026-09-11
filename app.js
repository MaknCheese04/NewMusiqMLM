const quick = [
  ["Night drives", "linear-gradient(135deg,#2a235e,#ea7c9c)"], ["Indie essentials", "linear-gradient(135deg,#f4b076,#d6566e)"], ["Soft focus", "linear-gradient(135deg,#86d6cd,#4569a0)"],
  ["Daily mix 01", "linear-gradient(135deg,#6853d9,#f5a8c5)"], ["Coffee & chords", "linear-gradient(135deg,#e2bd7e,#987341)"], ["Late night jazz", "linear-gradient(135deg,#1c293d,#ba6684)"]
];
const made = [
  ["Daylight", "An easy, uplifting mix", "linear-gradient(135deg,#f8be70,#e37d6c)"], ["Alt currents", "The best of alternative now", "linear-gradient(135deg,#1f345e,#59b3c2)"], ["Dream pop", "Float through the afternoon", "linear-gradient(135deg,#bb94e8,#ee92b5)"], ["Find your flow", "Electronic energy for you", "linear-gradient(135deg,#5dccb7,#2b6799)"], ["Soul kitchen", "Warm grooves, all day", "linear-gradient(135deg,#ec896c,#8b3c62)"]
];
const recent = [["Velvet Skies","Luna Vale","linear-gradient(135deg,#df789f,#f8c18e 55%,#493f7d)"],["After Hours","The Violets","linear-gradient(135deg,#2b315c,#a589e8)"],["Open Road","Milo Sun","linear-gradient(135deg,#7bc3c0,#d2e189)"],["Gold Dust","June Harper","linear-gradient(135deg,#e5ae5a,#8e456d)"],["Blue Motel","Neon Coast","linear-gradient(135deg,#315878,#cc6c80)"]];
const grid = document.querySelector('#quickGrid');
quick.forEach(([name, art]) => grid.insertAdjacentHTML('beforeend', `<button class="quick-card"><span class="art wave" style="--art:${art}"></span>${name}</button>`));
function addCards(id, cards) { document.querySelector(id).innerHTML = cards.map(([title, description, art]) => `<article class="card" data-title="${title}" data-artist="${description}" data-art="${art}"><div class="cover" style="--art:${art}"></div><h3>${title}</h3><p>${description}</p></article>`).join(''); }
addCards('#madeForYou', made); addCards('#recent', recent);
let playing = false, elapsed = 0, timer; const progress = document.querySelector('#progress');
function format(sec){return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`}
function togglePlay(){playing=!playing; document.querySelector('#playButton').textContent=playing?'❚❚':'▶'; document.querySelector('#heroPlay').innerHTML=playing?'<span>❚❚</span> Pause':'<span>▶</span> Play something'; if(playing){timer=setInterval(()=>{elapsed=(elapsed+1)%225;progress.value=elapsed;document.querySelector('#elapsed').textContent=format(elapsed)},1000)}else clearInterval(timer)}
document.querySelector('#playButton').onclick=togglePlay; document.querySelector('#heroPlay').onclick=togglePlay;
progress.oninput=e=>{elapsed=+e.target.value;document.querySelector('#elapsed').textContent=format(elapsed)};
document.querySelector('#likeButton').onclick=e=>{e.currentTarget.classList.toggle('liked');e.currentTarget.textContent=e.currentTarget.classList.contains('liked')?'♥':'♡';e.currentTarget.style.color=e.currentTarget.classList.contains('liked')?'#6856ed':''};
document.querySelectorAll('.card').forEach(card=>card.onclick=()=>{document.querySelector('#trackTitle').textContent=card.dataset.title;document.querySelector('#trackArtist').textContent=card.dataset.artist;const thumb=document.querySelector('#albumThumb');thumb.style.background=card.dataset.art;elapsed=0;progress.value=0;document.querySelector('#elapsed').textContent='0:00';if(!playing)togglePlay()});
document.querySelector('#next').onclick=()=>document.querySelector('#recent .card').click();
document.querySelectorAll('.nav-item[data-page]').forEach(item=>item.onclick=()=>{document.querySelector('.nav-item.active').classList.remove('active');item.classList.add('active')});
