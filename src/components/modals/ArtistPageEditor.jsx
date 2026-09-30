import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export function ArtistPageEditor({ artist, design, onSaved, onClose }) {
  const {user} = useAuth();
  const dialogRef = useRef(null);
  useEffect(() => { dialogRef.current?.showModal(); return () => dialogRef.current?.close(); }, []);
  const [draft, setDraft] = useState({
    bio: design?.bio || artist.career || '', hometown: design?.hometown || user.user_metadata?.hometown || '',
    tagline: design?.tagline || artist.tagline || '', portrait_url: design?.portrait_url || artist.portrait_url || '',
    artwork_url: design?.artwork_url || artist.artwork_url || '', accent_color: design?.accent_color || '#7561a9',
    layout: design?.layout || 'classic', extra_sections: design?.extra_sections || [],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = (key, value) => setDraft(previous => ({ ...previous, [key]: value }));
  const save = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data, error } = await supabase.from('artist_page_designs').upsert({ ...draft, bio: draft.bio.trim(), artist_id: artist.artist_id }).select().single();
      if (error) throw error;
      onSaved(data);
    } catch { setError('Could not save your page. Check your connection and verified artist access, then try again.'); }
    finally { setBusy(false); }
  };
  return <dialog ref={dialogRef} className="modal-card artist-editor" aria-labelledby="artist-editor-title" onCancel={event => {event.preventDefault();if(!busy)onClose();}}>
    <h2 id="artist-editor-title">Customize {artist.name}</h2>
    <p>Your bio, rankings, albums, and past work always remain on your page.</p>
    <form onSubmit={save}>
      <fieldset disabled={busy}>
        <label>Bio<textarea required maxLength={5000} rows={5} value={draft.bio} onChange={event => change('bio', event.target.value)} /></label>
        {Object.entries({tagline:'Tagline',hometown:'Public hometown / origin',portrait_url:'Portrait image URL',artwork_url:'Artwork image URL'}).map(([key,label]) => <label key={key}>{label}
          <input type={key.endsWith('_url') ? 'url' : 'text'} pattern={key.endsWith('_url') ? 'https://.*' : undefined}
            maxLength={key.endsWith('_url') ? 2000 : 200} value={draft[key]} onChange={event => change(key,event.target.value)} />
        </label>)}
        <label>Accent color<input type="color" value={draft.accent_color} onChange={event => change('accent_color',event.target.value)} /></label>
        <label>Layout<select value={draft.layout} onChange={event => change('layout',event.target.value)}>
          <option value="classic">Classic</option><option value="compact">Compact</option><option value="spotlight">Spotlight</option>
        </select></label>
        <h3>Your additional sections</h3>
        {draft.extra_sections.map((section,index) => <div className="artist-custom-section" key={index}>
          <label>Section title<input required maxLength={120} value={section.title} onChange={event => change('extra_sections',draft.extra_sections.map((item,i) => i === index ? {...item,title:event.target.value} : item))} /></label>
          <label>Text<textarea required maxLength={2500} rows={4} value={section.body} onChange={event => change('extra_sections',draft.extra_sections.map((item,i) => i === index ? {...item,body:event.target.value} : item))} /></label>
          <button type="button" onClick={() => change('extra_sections',draft.extra_sections.filter((_,i) => i !== index))}>Remove section</button>
          <button type="button" disabled={index === 0} onClick={() => {
            const sections = [...draft.extra_sections]; [sections[index-1],sections[index]] = [sections[index],sections[index-1]]; change('extra_sections',sections);
          }}>Move up</button>
        </div>)}
        <button type="button" disabled={draft.extra_sections.length >= 12} onClick={() => change('extra_sections',[...draft.extra_sections,{title:'',body:''}])}>Add section</button>
        <div className="artist-editor-actions"><button type="button" onClick={onClose}>Cancel</button><button type="submit">{busy ? 'Saving…' : 'Save page'}</button></div>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  </dialog>;
}
