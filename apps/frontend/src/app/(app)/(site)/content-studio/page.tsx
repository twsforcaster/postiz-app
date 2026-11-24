'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useUser } from '@gitroom/frontend/components/layout/user.context';

const formats=['Instagram caption','Facebook post','LinkedIn post','X thread','YouTube title and description','Short-video script','Hashtag suggestions','Call to action','Rewrite existing content'];
const languages=['English','Hindi','Spanish','French','Arabic','Thai'];
const tones=['Use brand voice','Professional','Conversational','Educational','Concise'];
type Provider={provider:string;configured:boolean};
type Result={provider:string;model:string;draft:string;usage:{inputTokens:number|null;outputTokens:number|null;totalTokens:number|null}};
export default function ContentStudio(){
 const user=useUser();
 return user?.orgId&&user.id?<Studio key={user.orgId+':'+user.id} workspaceId={user.orgId} userId={user.id} blocked={!!user.impersonate}/>:<p role="status">Workspace unavailable.</p>;
}
function Studio({workspaceId,userId,blocked}:{workspaceId:string;userId:string;blocked:boolean}){
 const request=useFetch();
 const {data,error,isLoading,mutate}=useSWR<Provider[]>(['marketing-ai-catalog',workspaceId,userId],async()=>{
  const r=await request('/user/marketing-ai/providers');if(!r.ok)throw Error('Unavailable');
  const b=await r.json();if(!Array.isArray(b.providers))throw Error('Invalid response');return b.providers;
 });
 const [provider,setProvider]=useState('');
 const [format,setFormat]=useState(formats[0]);
 const [language,setLanguage]=useState(languages[0]);
 const [tone,setTone]=useState(tones[0]);
 const [brief,setBrief]=useState('');
 const [result,setResult]=useState<Result|null>(null);
 const [draft,setDraft]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const lock=useRef(false);
 const configured=!!data?.some(p=>p.provider===provider&&p.configured===true);
 const field='block w-full mt-2 rounded-xl border border-newBorder bg-newBgColorInner p-3';
 async function generate(){
  if(lock.current||blocked||error||!configured||!brief.trim())return;
  lock.current=true;setBusy(true);setMessage('');
  try{
   const prompt=JSON.stringify({format,language,tone,brief:brief.trim(),instruction:'Return a draft for human review. Do not publish.'});
   const r=await request('/user/marketing-ai/draft',{method:'POST',body:JSON.stringify({workspaceId,provider,prompt})});
   if(!r.ok){setMessage(r.status===429?'Request limit reached. Try again after 60 seconds.':r.status===403?'This workspace is not authorized for AI generation.':r.status===503?'Provider is not configured.':'Generation failed.');return;}
   const b=await r.json();
   if(typeof b.draft!=='string'||!b.draft.trim()||typeof b.model!=='string'||!b.usage)throw Error('Invalid response');
   setResult(b);setDraft(b.draft);setMessage('Draft generated. Review before publishing.');
  }catch{setMessage('Unable to generate a draft.');}
  finally{lock.current=false;setBusy(false);}
 }
 async function copy(){try{await navigator.clipboard.writeText(draft);setMessage('Draft copied.');}catch{setMessage('Clipboard unavailable. Select and copy the text manually.');}}
 return <main className="flex-1 min-w-0 overflow-auto bg-newBgColorInner p-8 mobile:p-4"><div className="mx-auto max-w-[1240px] space-y-6">
  <header className="rounded-2xl bg-[#17182b] text-white p-6"><p className="text-xs tracking-widest text-[#b9f4da]">AI CONTENT STUDIO</p><h2 className="text-3xl font-semibold mt-2">Create with your brand in mind.</h2><p className="text-sm text-[#c5c7d8] mt-2">Generate editable drafts using your saved workspace brand context.</p></header>
  <div className="grid grid-cols-2 mobile:grid-cols-1 gap-5">
   <form className="rounded-2xl border border-newBorder p-5 space-y-4" onSubmit={e=>{e.preventDefault();void generate();}}>
    <h3 className="font-semibold text-xl">Content brief</h3>
    <fieldset disabled={busy||blocked} className="space-y-4">
    <label className="block">AI provider<select required className={field} value={provider} onChange={e=>setProvider(e.target.value)}><option value="">Select configured provider</option>{!error&&data?.map(p=><option key={p.provider} value={p.provider} disabled={!p.configured}>{p.provider}{p.configured?'':' — not configured'}</option>)}</select></label>
    <label className="block">Content format<select className={field} value={format} onChange={e=>setFormat(e.target.value)}>{formats.map(f=><option key={f}>{f}</option>)}</select></label>
    <label className="block">Language<select className={field} value={language} onChange={e=>setLanguage(e.target.value)}>{languages.map(l=><option key={l}>{l}</option>)}</select></label>
    <label className="block">Tone<select className={field} value={tone} onChange={e=>setTone(e.target.value)}>{tones.map(t=><option key={t}>{t}</option>)}</select></label>
    <label className="block">Topic, campaign or existing content<textarea required maxLength={3000} rows={6} className={field} value={brief} onChange={e=>setBrief(e.target.value)}/><span className="text-xs text-textItemBlur">{brief.length}/3000</span></label></fieldset>
    <p className="text-sm text-textItemBlur">{blocked?'Unavailable during impersonation.':isLoading?'Loading providers…':error?'Provider catalog unavailable.':!data?.some(p=>p.configured)?'No AI provider configured.':'Your brief and saved brand context will be sent to the selected provider.'}</p>
    {error&&<button type="button" onClick={()=>mutate()} className="underline">Retry catalog</button>}
    <button disabled={busy||blocked||!!error||!configured||!brief.trim()} className="rounded-xl bg-[#5145cd] text-white px-5 py-3 disabled:opacity-50">{busy?'Generating…':'Generate draft'}</button>
   </form>
   <section className="rounded-2xl border border-newBorder p-5 space-y-4"><h3 className="text-xl font-semibold">Draft review</h3><p role="status" aria-live="polite">{message}</p>
    <label className="block">Editable content<textarea className={field} rows={14} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Your generated draft will appear here." /></label>
    {result&&<div className="text-sm text-textItemBlur space-y-1"><p>Last generation: {result.provider} / {result.model}</p><p>Input tokens: {result.usage.inputTokens??'Unavailable'}</p><p>Output tokens: {result.usage.outputTokens??'Unavailable'}</p><p>Total tokens: {result.usage.totalTokens??'Unavailable'}</p></div>}
    <div className="flex flex-wrap gap-3"><button type="button" disabled={!draft.trim()} onClick={()=>void copy()} className="rounded-lg border border-newBorder px-4 py-2 disabled:opacity-50">Copy draft</button><Link href="/launches" className="underline">Open calendar</Link><Link href="/business-setup" className="underline">Edit brand profile</Link></div>
    <p className="text-xs text-textItemBlur">Drafts are not saved or published automatically. Copy your draft before leaving this page.</p>
   </section>
  </div><Link href="/overview" className="underline">Back to overview</Link>
 </div></main>;
}
