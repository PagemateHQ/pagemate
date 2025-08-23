'use client';

import { Provider, useAtomValue } from 'jotai';
import React from 'react';
import { FloatingOrb } from '../pagemate/FloatingOrb';
import { taskSelectorOpenAtom } from '../lib/atoms';

function PagemateContent({ children }: { children: React.ReactNode }) {
  const taskSelectorOpen = useAtomValue(taskSelectorOpenAtom);
  
  const defaultSuggestions = [
    'What does tenant insurance cover?',
    'How do I file a claim?',
    'How much coverage do I need for my rental?',
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
