import app from './app';
import { PORT } from './config';
import { SocketApp } from './socket_app';

const server = app.listen(PORT, () => {
  console.log('Express server listening on Port ', PORT);
});

export const SocketAppServer = new SocketApp(server);

export default server;
