import { RepoContext } from '@tokenyet/react-bloc';
import { GetServerSideProps } from 'next';
import React, { useContext } from 'react';
import Chat from '../../src/components/chat/chat';
import UserRepository from '../../src/repositories/user_repository';
import { SocketContext } from '../../src/socket';
import { AuthServerProcessor } from '../../src/utility/server_side_decorator';

export default function ChatPage() {
  const socketRepo = useContext(SocketContext);
  const repoContext = useContext(RepoContext);
  const userRepo = repoContext.of<UserRepository>(UserRepository);
  return <Chat socketRepo={socketRepo!} userRepo={userRepo!} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const auth = new AuthServerProcessor(context);

  return auth.process();
};
