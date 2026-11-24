'use client';
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';

const industries = ['E-commerce','Marketing agency','Financial education','Real estate','SaaS','Local business','Creator','Other'];
const goals = ['Brand awareness','Lead generation','Audience growth','Sales','Customer engagement'];
type Profile = {name:string; industry:string; goal:string; brandVoice:string; audience:string; products:string; guidelines:string};
const empty:Profile={name:'',industry:'',goal:'',brandVoice:'',audience:'',products:'',guidelines:''};
const fields = [
  ['brandVoice','Brand voice and tone',500],
  ['audience','Target audience',1000],
  ['products','Products and services',2000],
  ['guidelines','Content guidelines and restrictions',2000],
] as const;
export default function BusinessSetup(){
  const user=useUser();
  return user?.orgId && user.id ? <Setup key={user.orgId+':'+user.id} workspaceId={user.orgId} editable={['ADMIN','SUPERADMIN'].includes(user.role) && !user.impersonate}/> : <p role="status">Workspace unavailable.</p>;
}
function Setup({workspaceId,editable}:{workspaceId:string;editable:boolean}){
  const request=useFetch();
  const {data,error,isLoading,mutate}=useSWR(['marketing-profile',workspaceId],async()=>{
    const r=await request('/user/marketing-profile');
    if(!r.ok) throw new Error('Profile unavailable');
    const body=await r.json();
    if(!body || !('profile' in body)) throw new Error('Invalid response');
    return body.profile as Partial<Profile>|null;
  },{revalidateOnFocus:false});
  if(isLoading)return <p role="status" className="p-6">Loading brand profile…</p>;
  if(error || data===undefined)return <div className="p-6"><p role="alert">Profile unavailable.</p><button onClick={()=>mutate()}>Retry</button></div>;
  return <Editor workspaceId={workspaceId} editable={editable} initial={{...empty,...(data||{})}} onSaved={p=>mutate(p,{revalidate:false})}/>;
}
function Editor({workspaceId,editable,initial,onSaved}:{workspaceId:string;editable:boolean;initial:Profile;onSaved:(p:Profile)=>void}){
  const request=useFetch();
  const [profile,setProfile]=useState(initial);
  const [saving,setSaving]=useState(false);
  const [status,setStatus]=useState('');
  const [failed,setFailed]=useState(false);
  const set=(k:keyof Profile,v:string)=>{setProfile(p=>({...p,[k]:v}));setStatus('');};
  const inputClass="block w-full mt-2 rounded-lg border border-newBorder bg-newBgColorInner p-3";
  async function save(){
    setSaving(true);setStatus('');setFailed(false);
    try{
      const r=await request('/user/marketing-profile',{method:'POST',body:JSON.stringify({...profile,workspaceId})});
      if(!r.ok)throw new Error('Save failed');
      const b=await r.json();
      if(!b.profile || typeof b.profile.name!=='string')throw new Error('Invalid response');
      setProfile({...empty,...b.profile});onSaved(b.profile);setStatus('Brand profile saved.');
    }catch{setFailed(true);setStatus('Unable to save. Check your permissions or retry.');}
    finally{setSaving(false);}
  }
  return <main className="flex-1 min-w-0 overflow-auto p-8 mobile:p-4 bg-newBgColorInner"><div className="mx-auto max-w-[850px] space-y-6">
    <header className="rounded-2xl bg-[#17182b] text-white p-6"><p className="text-xs tracking-widest text-[#b9f4da]">BRAND INTELLIGENCE</p><h2 className="text-3xl font-semibold mt-2">Define your brand</h2><p className="mt-2 text-sm text-[#c5c7d8]">Maintain your workspace business context. AI generation integration is not yet enabled.</p></header>
    {!editable && <p role="status">Read-only access. An organization administrator can update this profile.</p>}
    <form onSubmit={e=>{e.preventDefault();if(editable&&!saving)void save();}} className="space-y-5">
    <fieldset disabled={!editable||saving} className="rounded-2xl border border-newBorder p-5 space-y-4">
      <legend className="font-semibold px-2">Business profile</legend>
      <label className="block">Business name<input required maxLength={100} value={profile.name} onChange={e=>set('name',e.target.value)} className={inputClass}/></label>
      <label className="block">Industry<select required value={profile.industry} onChange={e=>set('industry',e.target.value)} className={inputClass}><option value="">Select industry</option>{industries.map(i=><option key={i}>{i}</option>)}</select></label>
      <label className="block">Marketing objective<select required value={profile.goal} onChange={e=>set('goal',e.target.value)} className={inputClass}><option value="">Select objective</option>{goals.map(g=><option key={g}>{g}</option>)}</select></label>
    </fieldset>
    <fieldset disabled={!editable||saving} className="rounded-2xl border border-newBorder p-5 space-y-4"><legend className="font-semibold px-2">Brand context</legend>
      {fields.map(([key,label,max])=><label key={key} className="block">{label}<textarea rows={4} maxLength={max} value={profile[key]} onChange={e=>set(key,e.target.value)} className={inputClass}/><span className="text-xs text-textItemBlur">{profile[key].length}/{max}</span></label>)}
    </fieldset>
    <div role={failed?'alert':'status'}>{status}</div>
    <div className="flex flex-wrap items-center gap-4">{editable&&<button disabled={saving||!profile.name.trim()||!profile.industry||!profile.goal} className="rounded-lg bg-[#5145cd] text-white px-5 py-3 disabled:opacity-50">{saving?'Saving…':'Save brand profile'}</button>}<Link className="underline" href="/launches?onboarding=true">Connect channels</Link><Link className="underline" href="/overview">Overview</Link></div>
    </form>
  </div></main>;
}
