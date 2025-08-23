'use client';

import { Provider } from 'jotai';
import React from 'react';
import { FloatingOrb } from '../pagemate/FloatingOrb';

export function PagemateProvider({ children }: { children: React.ReactNode }) {
  const defaultSuggestions = [
    'What does tenant insurance cover?',
    'How do I file a claim?',
    'How much coverage do I need for my rental?',
  ];

  return (
    <Provider>
      {children}
      <FloatingOrb defaultSuggestions={defaultSuggestions} />
    </Provider>
  );
}