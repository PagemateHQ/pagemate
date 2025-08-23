import { AppProps } from 'next/app';
import React from 'react';
import { Provider } from 'jotai';

import { FloatingOrb } from '@/pagemate/FloatingOrb';
import { InstrumentSans } from '@/styles/fonts';
import '@/styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Component {...pageProps} />
      <FloatingOrb />

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
