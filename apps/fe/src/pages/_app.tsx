import { AppProps } from 'next/app';
import React from 'react';
import { Provider } from 'jotai';

import { FloatingOrb } from '@/pagemate/FloatingOrb';
import { InstrumentSans } from '@/styles/fonts';
import '@/styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  const defaultSuggestions = [
    'What is the Austin Office Phone Number?',
    'Are there any updates on the claim ACM-123456?',
    'Insurance quote for $20k Car and $1M Home in MA',
  ];

  return (
    <Provider>
      <Component {...pageProps} />
      <FloatingOrb defaultSuggestions={defaultSuggestions} />

      <style jsx global>{`
        * {
          font-family:
            ${InstrumentSans.style.fontFamily}, system-ui, sans-serif !important;
          font-optical-sizing: auto;
        }
      `}</style>

      <div id="portal" />
    </Provider>
  );
}

export default MyApp;
