import 'reflect-metadata';
import * as React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@material-ui/core/styles';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@material-ui/core/CssBaseline';
import createCache from '@emotion/cache';
import theme from '../src/theme';
import { SocketContext, SocketRepo } from '../src/socket';
import Ccookie from 'js-cookie';
import { RepoContext, Repositories } from '@tokenyet/react-bloc';
import UserRepository from '../src/repositories/user_repository';

// Comment out for debugging
// import { Bloc } from '@tokenyet/bloc';
// import { DebugBlocObserver } from '../src/utility/bloc_observable';

export const cache = createCache({ key: 'css', prepend: true });

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  const [socketRepo] = React.useState(new SocketRepo());

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement!.removeChild(jssStyles);
    }
    if (Ccookie.get('TOKEN')) socketRepo.connect(); // Try to connect by default

    // Comment out for debugging
    // Bloc.observer = new DebugBlocObserver();
  }, []);

  return (
    <CacheProvider value={cache}>
      <Head>
        <title>My page</title>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <RepoContext.Provider value={new Repositories([new UserRepository()])}>
        <SocketContext.Provider value={socketRepo}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </SocketContext.Provider>
      </RepoContext.Provider>
    </CacheProvider>
  );
}
