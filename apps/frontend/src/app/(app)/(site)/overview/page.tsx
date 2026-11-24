'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useUser } from '@gitroom/frontend/components/layout/user.context';

type Channel = { id: string; name: string; identifier: string; disabled: boolean; refreshNeeded: boolean; inBetweenSteps: boolean };
const shortcuts = [
  { href: '/channels', title: 'Social channels', description: 'Review connection status and available platform adapters.' },
  { href: '/business-setup', title: 'Brand Intelligence', description: 'Manage business identity, audience and brand voice.' },
  { href: '/launches', title: 'Content calendar', description: 'Create, review and schedule your next post.' },
  { href: '/agents', title: 'AI workspace', description: 'Open the existing AI assistant.' },
  { href: '/analytics', title: 'Performance', description: 'Explore available channel analytics.' },
  { href: '/media', title: 'Asset library', description: 'Manage your creative assets.' },
];
export default function Overview() {
  const request = useFetch();
  const user = useUser();
  const { data, error, isLoading, mutate } = useSWR<Channel[]>(user?.orgId ? ['marketing-overview-channels', user.orgId] : null, async () => {
    const response = await request('/integrations/list');
    if (!response.ok) throw new Error('Channels unavailable');
    const body = await response.json();
    if (!Array.isArray(body.integrations)) throw new Error('Invalid channel response');
    return body.integrations;
  }, { keepPreviousData: false });
  const ready = data?.filter(c => !c.disabled && !c.refreshNeeded && !c.inBetweenSteps).length;
  const attention = data && ready !== undefined ? data.length - ready : undefined;
  return (
    <main className="flex-1 min-w-0 overflow-auto bg-newBgColorInner p-8 mobile:p-4">
      <div className="mx-auto max-w-[1240px] space-y-8">
        <section className="rounded-[20px] bg-[#17182b] p-8 mobile:p-5 text-white">
          <p className="text-[#b9f4da] text-xs font-semibold tracking-widest uppercase">Marketing command center</p>
          <h2 className="mt-3 text-3xl mobile:text-2xl font-semibold tracking-tight">Make every channel count.</h2>
          <p className="mt-3 max-w-xl text-[#c5c7d8]">Plan your content, manage connected accounts and explore performance from one workspace.</p>
          <Link href="/launches" className="mt-6 inline-flex rounded-xl bg-[#5145cd] px-5 py-3 font-semibold text-white">Open content calendar →</Link>
        </section>
        <section aria-label="Channel overview" className="space-y-3">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Channel overview</h2><button type="button" onClick={() => mutate()} className="rounded-lg border border-newBorder px-3 py-2 text-sm">Refresh</button></div>
          <div role="status" className="text-sm text-textItemBlur">{isLoading ? 'Loading channel data…' : error ? 'Channel data unavailable. Try refreshing.' : data ? 'Current workspace · connection status' : 'Select a workspace.'}</div>
          <div className="grid grid-cols-3 mobile:grid-cols-1 gap-4">
            {[
              ['Connected accounts', data?.length],
              ['Ready by configuration', ready],
              ['Require attention', attention],
            ].map(([label, value]) => <div key={label} className="rounded-2xl border border-newBorder p-5"><p className="text-sm text-textItemBlur">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{error ? '—' : value ?? '—'}</p></div>)}
          </div>
          {data && !error && data.length === 0 && <p className="rounded-xl border border-newBorder p-4">No connected accounts yet. <Link className="underline" href="/launches">Connect a channel in the calendar.</Link></p>}
        </section>
        <section className="space-y-3"><h2 className="text-xl font-semibold">Your workspace</h2><div className="grid grid-cols-2 mobile:grid-cols-1 gap-4">{shortcuts.map(s => <Link key={s.href} href={s.href} className="rounded-2xl border border-newBorder p-5 hover:bg-boxFocused transition-colors"><h3 className="font-semibold">{s.title} →</h3><p className="mt-2 text-sm text-textItemBlur">{s.description}</p></Link>)}</div></section>
      </div>
    </main>
  );
}
