import { Provider } from 'jotai';
import { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

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
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

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
