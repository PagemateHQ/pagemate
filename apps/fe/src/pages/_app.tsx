import { AppProps } from 'next/app';
import React from 'react';
import { Provider } from 'jotai';

import { FloatingOrb } from '@/pagemate/FloatingOrb';
import { InstrumentSans } from '@/styles/fonts';
import '@/styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  const defaultSuggestions = [
    'Help me find a specific transaction',
    'How can I transfer money between accounts?',
    'How do I deposit a check?',
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
