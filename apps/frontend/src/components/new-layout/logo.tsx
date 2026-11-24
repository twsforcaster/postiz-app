'use client';

export const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 48 48" role="img" aria-label={process.env.NEXT_PUBLIC_MARKETING_OS_NAME || 'Marketing OS'} className="mt-[8px] shrink-0">
    <rect x="1" y="1" width="46" height="46" rx="13" fill="#5145CD"/>
    <path d="M10 34V15l14 12 14-12v19" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="24" cy="10" r="2.5" fill="#B9F4DA"/>
  </svg>
);
