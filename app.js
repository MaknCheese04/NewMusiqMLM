const quick = [
  ["Night drives", "linear-gradient(135deg,#2a235e,#ea7c9c)"], ["Indie essentials", "linear-gradient(135deg,#f4b076,#d6566e)"], ["Soft focus", "linear-gradient(135deg,#86d6cd,#4569a0)"],
  ["Daily mix 01", "linear-gradient(135deg,#6853d9,#f5a8c5)"], ["Coffee & chords", "linear-gradient(135deg,#e2bd7e,#987341)"], ["Late night jazz", "linear-gradient(135deg,#1c293d,#ba6684)"]
];
const made = [
  ["Daylight", "An easy, uplifting mix", "linear-gradient(135deg,#f8be70,#e37d6c)"], ["Alt currents", "The best of alternative now", "linear-gradient(135deg,#1f345e,#59b3c2)"], ["Dream pop", "Float through the afternoon", "linear-gradient(135deg,#bb94e8,#ee92b5)"], ["Find your flow", "Electronic energy for you", "linear-gradient(135deg,#5dccb7,#2b6799)"], ["Soul kitchen", "Warm grooves, all day", "linear-gradient(135deg,#ec896c,#8b3c62)"]
];
const recent = [["Velvet Skies","Luna Vale","linear-gradient(135deg,#df789f,#f8c18e 55%,#493f7d)"],["After Hours","The Violets","linear-gradient(135deg,#2b315c,#a589e8)"],["Open Road","Milo Sun","linear-gradient(135deg,#7bc3c0,#d2e189)"],["Gold Dust","June Harper","linear-gradient(135deg,#e5ae5a,#8e456d)"],["Blue Motel","Neon Coast","linear-gradient(135deg,#315878,#cc6c80)"]];
const artists = [["Luna Vale","Dream pop · 128K monthly listeners","LV","linear-gradient(135deg,#df789f,#6d568d)"],["The Violets","Indie rock · 92K monthly listeners","TV","linear-gradient(135deg,#252b58,#a789e4)"],["Milo Sun","Alternative · 77K monthly listeners","MS","linear-gradient(135deg,#69beba,#d6df8d)"],["June Harper","Soul · 64K monthly listeners","JH","linear-gradient(135deg,#e19d56,#974565)"]];
const defaultProfile = { name: 'Alex Rivera', bio: 'Chasing warm melodies and new late-night discoveries.', genres: ['Indie pop', 'Dream pop', 'Neo soul', 'Electronic'] };
let listener = JSON.parse(localStorage.getItem('soundwave-profile') || 'null') || defaultProfile;
let authMode = 'signin', accountRole = 'listener';
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
function initials(name) { return name.split(' ').map(word => word[0]).slice(0,2).join('').toUpperCase(); }
function renderProfile() { const letters = initials(listener.name); document.querySelector('#sidebarName').textContent = listener.name; document.querySelector('#sidebarAvatar').textContent = letters; document.querySelector('#profileAvatar').textContent = letters; document.querySelector('#profileName').textContent = listener.name; document.querySelector('#profileBio').textContent = listener.bio; document.querySelector('#genreChips').innerHTML = listener.genres.map(genre => `<span>${genre}</span>`).join(''); document.querySelector('#artistGrid').innerHTML = artists.map(([name, detail, avatar, art]) => `<article class="artist-card"><div class="artist-avatar" style="--artist-art:${art}">${avatar}</div><div><h3>${name}</h3><p>${detail}</p></div><button class="following">Following</button></article>`).join(''); }
function openProfile() { document.querySelector('.content').hidden = true; document.querySelector('#profilePage').hidden = false; renderProfile(); window.scrollTo(0, 0); }
document.querySelector('#profileTrigger').onclick = openProfile; document.querySelector('#closeProfile').onclick = () => { document.querySelector('#profilePage').hidden = true; document.querySelector('.content').hidden = false; };
document.querySelector('#openSettings').onclick = () => { document.querySelector('#profilePage').hidden = true; document.querySelector('#settingsPage').hidden = false; window.scrollTo(0, 0); }; document.querySelector('#closeSettings').onclick = () => { document.querySelector('#settingsPage').hidden = true; document.querySelector('#profilePage').hidden = false; };
function editProfile() { document.querySelector('#nameInput').value = listener.name; document.querySelector('#bioInput').value = listener.bio; document.querySelector('#genresInput').value = listener.genres.join(', '); document.querySelector('#editDialog').showModal(); }
document.querySelector('#editProfile').onclick = editProfile; document.querySelector('#editProfileSecondary').onclick = editProfile;
document.querySelector('#profileForm').addEventListener('submit', event => { if (event.submitter.value !== 'save') return; const genres = document.querySelector('#genresInput').value.split(',').map(item => item.trim()).filter(Boolean).slice(0, 6); listener = { name: document.querySelector('#nameInput').value.trim() || defaultProfile.name, bio: document.querySelector('#bioInput').value.trim() || defaultProfile.bio, genres: genres.length ? genres : defaultProfile.genres }; localStorage.setItem('soundwave-profile', JSON.stringify(listener)); renderProfile(); });
renderProfile();
const authScreen = document.querySelector('#authScreen');
const authForm = document.querySelector('#authForm');
function updateAuth() {
  const registering = authMode === 'register';
  document.querySelector('#authTitle').textContent = registering ? 'Make it yours' : 'Welcome back';
  document.querySelector('#authSubtitle').textContent = registering ? (accountRole === 'artist' ? 'Set up your artist home and share your sound.' : 'Build a music home made for your taste.') : 'Sign in to continue listening where you left off.';
  document.querySelector('#authSubmit').textContent = registering ? 'Create account' : 'Sign in';
  document.querySelector('#authSwitch').innerHTML = registering ? 'Already have an account? <button type="button" id="toggleAuth">Sign in</button>' : 'New to soundwave? <button type="button" id="toggleAuth">Create an account</button>';
  document.querySelector('#nameField').hidden = !registering;
  document.querySelector('#artistNameField').hidden = !(registering && accountRole === 'artist');
  document.querySelector('#authPassword').autocomplete = registering ? 'new-password' : 'current-password';
  document.querySelector('#rolePicker').hidden = !registering;
  document.querySelector('#authError').textContent = '';
  document.querySelector('#toggleAuth').onclick = () => { authMode = registering ? 'signin' : 'register'; updateAuth(); };
}
document.querySelector('#rolePicker').onclick = event => { const role = event.target.dataset.role; if (!role) return; accountRole = role; document.querySelectorAll('#rolePicker button').forEach(button => button.classList.toggle('selected', button.dataset.role === role)); updateAuth(); };
authForm.onsubmit = event => { event.preventDefault(); const email = document.querySelector('#authEmail').value.trim().toLowerCase(); const password = document.querySelector('#authPassword').value; const name = document.querySelector('#authName').value.trim(); const artistName = document.querySelector('#artistName').value.trim(); const error = document.querySelector('#authError'); const accounts = JSON.parse(localStorage.getItem('soundwave-accounts') || '[]'); if (authMode === 'register') { if (!name || (accountRole === 'artist' && !artistName)) { error.textContent = 'Please complete the required profile details.'; return; } if (accounts.some(account => account.email === email)) { error.textContent = 'An account with that email already exists.'; return; } accounts.push({ email, password, name, role: accountRole, artistName }); localStorage.setItem('soundwave-accounts', JSON.stringify(accounts)); listener = { ...listener, name }; localStorage.setItem('soundwave-profile', JSON.stringify(listener)); } else { const account = accounts.find(item => item.email === email && item.password === password); if (!account) { error.textContent = 'We could not find an account with those details.'; return; } listener = { ...listener, name: account.name }; localStorage.setItem('soundwave-profile', JSON.stringify(listener)); } localStorage.setItem('soundwave-session', email); authScreen.hidden = true; renderProfile(); };
if (localStorage.getItem('soundwave-session')) authScreen.hidden = true; else updateAuth();
document.querySelector('#signOut').onclick = () => { localStorage.removeItem('soundwave-session'); document.querySelector('#settingsPage').hidden = true; document.querySelector('.content').hidden = false; authMode = 'signin'; document.querySelector('#authForm').reset(); updateAuth(); authScreen.hidden = false; };
