'use client';
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useUser } from '@gitroom/frontend/components/layout/user.context';

type Channel={id:string;name:string;identifier:string;disabled:boolean;refreshNeeded:boolean;inBetweenSteps:boolean};
type Provider={name:string;identifier:string;isExternal?:boolean;isChromeExtension?:boolean;isWeb3?:boolean;customFields?:unknown};
function status(c:Channel){
  if(c.disabled===true)return 'Disabled';
  if(c.refreshNeeded===true)return 'Reconnect required';
  if(c.inBetweenSteps===true)return 'Setup incomplete';
  if(c.disabled===false&&c.refreshNeeded===false&&c.inBetweenSteps===false)return 'Configured';
  return 'Unknown';
}
export default function Channels(){
  const user=useUser();
  return user?.orgId&&user.id?<Workspace key={user.orgId+':'+user.id} id={user.orgId} userId={user.id}/>:<p role="status">Workspace unavailable.</p>;
}
function Workspace({id,userId}:{id:string;userId:string}){
  const request=useFetch();
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('All');
  const channels=useSWR<Channel[]>(['marketing-channels',id,userId],async()=>{
    const r=await request('/integrations/list');if(!r.ok)throw Error('Unavailable');
    const b=await r.json();if(!Array.isArray(b.integrations))throw Error('Invalid response');
    return b.integrations;
  },{refreshInterval:60000,keepPreviousData:false});
  const providers=useSWR<Provider[]>(['marketing-providers',id,userId],async()=>{
    const r=await request('/integrations');if(!r.ok)throw Error('Unavailable');
    const b=await r.json();if(!Array.isArray(b.social))throw Error('Invalid response');
    return b.social;
  },{keepPreviousData:false});
  const rows=channels.error?undefined:channels.data;
  const visible=rows?.filter(c=>(filter==='All'||status(c)===filter)&&(c.name+' '+c.identifier).toLowerCase().includes(search.toLowerCase()));
  return <main className="flex-1 min-w-0 overflow-auto p-8 mobile:p-4 bg-newBgColorInner"><div className="max-w-[1200px] mx-auto space-y-6">
    <header className="rounded-2xl bg-[#17182b] text-white p-6"><p className="text-xs tracking-widest text-[#b9f4da]">CHANNEL MANAGEMENT</p><h2 className="text-3xl font-semibold mt-2">Connect. Monitor. Manage.</h2><p className="text-sm mt-2 text-[#c5c7d8]">Stored connection status, not a live provider connectivity test.</p><Link href="/launches?onboarding=true" className="inline-block mt-4 rounded-xl bg-[#5145cd] px-5 py-3">Connect channels</Link></header>
    <section aria-label="Channel summary" className="grid grid-cols-3 mobile:grid-cols-1 gap-3">{[['Accounts',rows?.length],['Configured',rows?.filter(c=>status(c)==='Configured').length],['Needs attention',rows?.filter(c=>status(c)!=='Configured').length]].map(([label,n])=><div key={label} className="rounded-xl border border-newBorder p-4"><p className="text-sm text-textItemBlur">{label}</p><p className="text-3xl font-semibold mt-2">{n??'—'}</p></div>)}</section>
    <section className="space-y-3"><div className="flex flex-wrap gap-3"><input aria-label="Search channels" placeholder="Search channels" value={search} onChange={e=>setSearch(e.target.value)} className="rounded-lg border border-newBorder bg-newBgColorInner p-2"/><select aria-label="Filter channel status" value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-lg border border-newBorder bg-newBgColorInner p-2">{['All','Configured','Disabled','Reconnect required','Setup incomplete','Unknown'].map(s=><option key={s}>{s}</option>)}</select><button type="button" onClick={()=>channels.mutate()} className="rounded-lg border border-newBorder px-4">Refresh status</button></div>
    <p role="status">{channels.error?'Channel status unavailable.':channels.isLoading?'Loading channels…':rows?.length===0?'No connected channels.':visible?.length===0?'No matching channels.':''}</p>
    {visible?.map(c=><article key={c.id} className="rounded-xl border border-newBorder p-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">{c.name}</h3><p className="text-xs text-textItemBlur">{c.identifier}</p></div><span>{status(c)}</span><Link href="/launches" className="underline text-sm">Manage in calendar</Link></article>)}</section>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Available provider adapters</h2><p className="text-sm text-textItemBlur">Listed by the server; credentials and provider approval are not verified here.</p><p role="status">{providers.error?'Provider catalog unavailable.':providers.isLoading?'Loading providers…':providers.data?.length===0?'No available adapters.':''}</p><div className="grid grid-cols-3 mobile:grid-cols-1 gap-3">{!providers.error&&providers.data?.map(p=><article key={p.identifier} className="rounded-xl border border-newBorder p-4"><h3 className="font-semibold">{p.name}</h3><p className="text-xs text-textItemBlur">{p.isChromeExtension?'Extension required':p.isExternal?'External instance required':p.isWeb3?'Web3 connection':p.customFields?'Additional configuration':'Standard connection flow'}</p></article>)}</div></section>
    <Link className="underline" href="/overview">Back to overview</Link>
  </div></main>;
}
