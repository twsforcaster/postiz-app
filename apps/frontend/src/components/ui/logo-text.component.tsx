import React from 'react';
import { Logo } from '../new-layout/logo';

export const LogoTextComponent = () => (
  <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
    <Logo />
    <span>{process.env.NEXT_PUBLIC_MARKETING_OS_NAME || 'Marketing OS'}</span>
  </span>
);
