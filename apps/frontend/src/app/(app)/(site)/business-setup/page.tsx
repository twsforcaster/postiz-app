'use client';
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';

const industries = ['E-commerce','Marketing agency','Financial education','Real estate','SaaS','Local business','Creator','Other'];
const goals = ['Brand awareness','Lead generation','Audience growth','Sales','Customer engagement'];
export default function BusinessSetup() {
  const user = useUser();
  return user?.orgId && user.id ? <Setup key={user.orgId + ':' + user.id} /> : <p role="status">Workspace unavailable.</p>;
}
function Setup() {
  const request = useFetch();
  const user = useUser();
  const [step,setStep] = useState(0);
  const [name,setName] = useState('');
  const [industry,setIndustry] = useState('');
  const [goal,setGoal] = useState('');
  const {data,error,isLoading,mutate} = useSWR(user?.orgId ? ['business-setup-channels',user.orgId] : null, async () => {
    const r = await request('/integrations/list');
    if (!r.ok) throw new Error('Unavailable');
    const body = await r.json();
    if (!Array.isArray(body.integrations)) throw new Error('Invalid response');
    return body.integrations.length as number;
  });
  const valid = step === 0 ? !!name.trim() && !!industry : step === 1 ? !!goal : true;
  return <main className="flex-1 min-w-0 overflow-auto p-8 mobile:p-4 bg-newBgColorInner">
    <div className="mx-auto max-w-[720px] space-y-6">
      <header><p className="text-sm text-textItemBlur">WORKSPACE SETUP</p><h2 className="text-3xl font-semibold mt-2">Build your marketing workspace</h2><p className="mt-2 text-sm text-textItemBlur">Configure your business profile and connect your channels.</p></header>
      <ol className="grid grid-cols-3 gap-2">{['Business','Objectives','Channels'].map((s,i)=><li key={s} aria-current={step===i?'step':undefined} className={'rounded-xl border border-newBorder p-3 text-sm '+(step===i?'bg-boxFocused font-semibold':'')}>{i+1}. {s}</li>)}</ol>
      <form className="rounded-2xl border border-newBorder p-6 space-y-5" onSubmit={e=>{e.preventDefault();if(valid && step<2)setStep(step+1);}}>
        {step===0 && <><label className="block">Business name<input required maxLength={100} value={name} onChange={e=>setName(e.target.value)} className="block w-full mt-2 rounded-lg border border-newBorder bg-newBgColorInner p-3"/></label><label className="block">Industry<select required value={industry} onChange={e=>setIndustry(e.target.value)} className="block w-full mt-2 rounded-lg border border-newBorder bg-newBgColorInner p-3"><option value="">Select industry</option>{industries.map(i=><option key={i}>{i}</option>)}</select></label></>}
        {step===1 && <fieldset className="space-y-3"><legend className="font-semibold mb-3">Primary marketing objective</legend>{goals.map(g=><label key={g} className="flex items-center gap-3 rounded-xl border border-newBorder p-3"><input type="radio" name="goal" checked={goal===g} onChange={()=>setGoal(g)} required/>{g}</label>)}</fieldset>}
        {step===2 && <div className="space-y-3"><h3 className="font-semibold">Review your setup</h3><p>{name} · {industry}</p><p>Objective: {goal}</p><p role="status">{isLoading?'Loading channels…':error?'Channel status unavailable':data===undefined?'Channel status unavailable':data+' connected accounts'}</p><button type="button" className="underline" onClick={()=>mutate()}>Refresh channels</button><div><Link href="/launches?onboarding=true" className="underline">Open existing channel connection wizard</Link></div><p className="text-sm text-textItemBlur">Business profile is a temporary draft in this session. Server storage is not yet implemented; leaving this page discards it.</p></div>}
        <div className="flex justify-between items-center gap-3">{step>0?<button type="button" onClick={()=>setStep(step-1)} className="rounded-lg border border-newBorder px-4 py-2">Back</button>:<Link href="/overview">Cancel</Link>}{step<2?<button disabled={!valid} className="rounded-lg bg-[#5145cd] text-white px-5 py-3 disabled:opacity-50">Continue</button>:<Link href="/overview" className="rounded-lg bg-[#5145cd] text-white px-5 py-3">Return to overview</Link>}</div>
      </form>
    </div>
  </main>;
}
