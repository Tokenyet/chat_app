import { Button, Container, Paper, Typography } from '@material-ui/core';
import { useRouter } from 'next/router';
import React from 'react';
import Scaffold from '../src/components/scaffold/scaffold';

export default function Index() {
  const router = useRouter();

  return (
    <Scaffold>
      <Container style={{ paddingTop: '10vh' }} maxWidth={'sm'}>
        <Paper
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '400px',
            padding: 32,
          }}
          elevation={12}
        >
          <Typography style={{ wordBreak: 'break-word' }} variant={'h6'}>
            {'Welcome to socket.io demo.'}
          </Typography>
          <Typography style={{ wordBreak: 'break-word' }} variant={'subtitle1'}>
            {'This is a simple chat application.'}
          </Typography>
          <Typography style={{ wordBreak: 'break-word' }} variant={'subtitle2'}>
            {'With 3+ years experiences on Material-UI.'}
          </Typography>
          <Typography style={{ wordBreak: 'break-word' }} variant={'body1'}>
            {
              // eslint-disable-next-line quotes
              "A bunch of packages are using, but don't mind or afraid If you just want to learn socket.io."
            }
          </Typography>
          <Typography style={{ wordBreak: 'break-word' }} variant={'body2'}>
            {'Feel free to ask or pr to make It better.'}
          </Typography>
        </Paper>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: 16,
          }}
        >
          <Button onClick={() => router.push('/login')}>{'Go to Login'}</Button>
        </div>
      </Container>
    </Scaffold>
  );
}
