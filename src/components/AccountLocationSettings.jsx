import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function AccountLocationSettings() {
  const {user} = useAuth();
  const [location,setLocation] = useState(null);
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);
  useEffect(() => {
    let active=true;
    supabase.from('account_locations').select('hometown,mailing_address').eq('user_id',user.id).single().then(({data,error})=>{
      if(!active)return;
      if(error)setStatus('Could not load your address settings.'); else setLocation(data);
    });
    return()=>{active=false;};
  },[user.id]);
  return <section className="artist-access-card"><h2>Location and private address</h2>
    <p>Your mailing address stays private. Your public hometown is shown on your artist page when you add it in the page editor.</p>
    {location && <form className="account-location-form" onSubmit={async event=>{
      event.preventDefault();setBusy(true);setStatus('');
      try {
        const {error}=await supabase.from('account_locations').update(location).eq('user_id',user.id);
        if(error)throw error;setStatus('Location settings saved.');
      }catch{setStatus('Could not save. Please try again.');}finally{setBusy(false);}
    }}>
      <fieldset disabled={busy}>
        <label>Hometown / place of origin<input maxLength={200} value={location.hometown} onChange={event=>setLocation({...location,hometown:event.target.value})} /></label>
        {Object.entries({street:'Street address',city:'City',region:'State / region',postalCode:'Postal code',country:'Country'}).map(([key,label])=><label key={key}>{label}<input maxLength={200} value={location.mailing_address[key] || ''} onChange={event=>setLocation({...location,mailing_address:{...location.mailing_address,[key]:event.target.value}})} /></label>)}
        <button type="submit">{busy ? 'Saving…' : 'Save location settings'}</button>
      </fieldset>
    </form>}
    <p role="status">{status}</p>
  </section>;
}
