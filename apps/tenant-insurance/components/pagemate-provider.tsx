'use client';

import { Provider, useAtomValue } from 'jotai';
import React from 'react';
import { FloatingOrb } from '../pagemate/FloatingOrb';
import { taskSelectorOpenAtom } from '../lib/atoms';

function PagemateContent({ children }: { children: React.ReactNode }) {
  const taskSelectorOpen = useAtomValue(taskSelectorOpenAtom);
  
  const defaultSuggestions = [
    'What is the Austin Office Phone Number?',
    'Are there any updates on the claim ACM-123456?',
    'Insurance quote for $20k Car and $1M Home in MA',
  ];

  return (
    <>
      {children}
      {!taskSelectorOpen && <FloatingOrb defaultSuggestions={defaultSuggestions} />}
    </>
  );
}

export function PagemateProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <PagemateContent>{children}</PagemateContent>
    </Provider>
  );
}
