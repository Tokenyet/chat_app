import {
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
} from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { FormzStatus, useBloc } from '@tokenyet/react-bloc';
import React from 'react';
// import { Message } from '../../data/room';
import UserRepository from '../../repositories/user_repository';
import { SocketRepo } from '../../socket';
import { AddUserDialog } from './components/add_user_dialog';
import { ChatMessageTile } from './components/chat_message_tile';
import { ChatTile } from './components/chat_tile';
import { ChatMessage } from './data/chat_message';
import {
  AddUserEvent,
  ChatBloc,
  ChatEvent,
  ChatState,
  FetchHistoryEvent,
  SendMessageEvent,
  ViewMessageEvent,
} from './_bloc/chat_bloc';

export default function Chat({
  socketRepo,
  userRepo,
}: {
  socketRepo: SocketRepo;
  userRepo: UserRepository;
}) {
  const [showAddUserDialog, setAddUserDialog] = React.useState(false);
  const [typeMessage, setTypeMessage] = React.useState('');
  const [chatState, chatBloc] = useBloc<ChatBloc, ChatState, ChatEvent>(
    () => new ChatBloc(userRepo, socketRepo)
  );
  const [currentPageId, setCurrentPageId] = React.useState<string | null>(null);
  const [chatter, setChatter] = React.useState<ChatMessage | null>(null);

  // Update chatter for handy
  React.useEffect(() => {
    // const chatter = chatState.getChatterById(currentPageId ?? '');
    // setChatter(chatter);

    // Padding messages when the message is not enough
    const msgs = chatState.realtimeMsgs.get(currentPageId!);
    if (msgs == null || msgs.length < 10) {
      chatBloc.add(new FetchHistoryEvent({ id: currentPageId! }));
    }
  }, [currentPageId]);

  // Update chatter
  React.useEffect(() => {
    const chatter = chatState.getChatterById(currentPageId ?? '');
    setChatter(chatter);
  }, [chatState]);


  // Change page, clear type messages
  React.useEffect(() => {
    setTypeMessage('');
  }, [currentPageId]);

  // Page Dispose
  React.useEffect(() => {
    return function cleanup() {
      chatBloc.dispose();
    };
  }, []);

  return (
    <React.Fragment>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        <Grid container style={{ width: '100%', height: 'calc(100% - 20px)' }}>
          <Grid item md={3} style={{ borderRight: '4px solid grey' }}>
            {chatState == null ? (
              <div
                style={{ position: 'relative', width: '100%', height: '100%' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <CircularProgress />
                </div>
              </div>
            ) : (
              <List style={{ height: '100%', padding: 0 }}>
                <ListItem
                  button
                  style={{ backgroundColor: 'beige' }}
                  onClick={() => setAddUserDialog(true)}
                >
                  <ListItemText primary={'Add user'} />
                  <ListItemSecondaryAction
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <AddIcon />
                  </ListItemSecondaryAction>
                </ListItem>
                {chatState.chatters.map((chatter) => {
                  return (
                    <ChatTile
                      key={chatter.chatterId}
                      avatarUrl={chatter.picture}
                      name={chatter.name}
                      latestMessage={chatter.latestMessage ?? null}
                      unreadCount={chatter.unreadCount}
                      isOnline={chatter.isOnline}
                      isSelected={currentPageId == chatter.chatterId}
                      onSelect={() => {
                        chatBloc.add(
                          new ViewMessageEvent({ read: chatter.chatterId })
                        );
                        setCurrentPageId(chatter.chatterId);
                      }}
                    />
                  );
                })}
              </List>
            )}
          </Grid>
          <Grid item md={9}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <div
                style={{
                  flexGrow: 1,
                  marginLeft: 32,
                  marginRight: 32,
                  paddingTop: 32,
                  paddingBottom: 16,
                  paddingRight: 22,
                  height: 0,
                  borderBottom: '1px solid grey',
                  wordBreak: 'break-all',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-line',
                  overflow: 'auto',
                }}
              >
                <ChatLoader
                  chatState={chatState}
                  chatter={chatter}
                  onLoad={() => {
                    chatBloc.add(
                      new FetchHistoryEvent({ id: chatter?.chatterId! })
                    );
                  }}
                />
                {chatter == null ? (
                  <div />
                ) : (
                  (chatState.realtimeMsgs.get(chatter.chatterId) ?? [])
                    .slice(0)
                    .reverse()
                    .map((msg) => {
                      return (
                        <ChatMessageTile
                          key={msg.createdAt.getTime()}
                          avatarUrl={msg.from.picture}
                          message={msg.message}
                          createdAt={msg.createdAt}
                          self={msg.from._id === chatState.hostId}
                        />
                      );
                    })
                )}
              </div>
              <div
                style={{
                  padding: 32,
                }}
              >
                <ChatTextField
                  currentPageId={currentPageId}
                  setTypeMessage={setTypeMessage}
                  typeMessage={typeMessage}
                  onSend={() => {
                    if (currentPageId == null) return;
                    chatBloc.add(
                      new SendMessageEvent({
                        message: typeMessage,
                        to: currentPageId,
                      })
                    );
                    setTypeMessage('');
                  }}
                />
              </div>
            </div>
          </Grid>
        </Grid>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 20,
            borderTop: '1px solid black',
            backgroundColor: 'black',
            color: 'white',
            fontSize: 8,
            textAlign: 'center',
          }}
        >
          {'@Created by tokenyete'}
        </div>
      </div>
      <AddUserDialog
        open={showAddUserDialog}
        onClose={() => setAddUserDialog(false)}
        onNameSubmit={(name) => {
          chatBloc.add(new AddUserEvent({ name: name }));
          setAddUserDialog(false);
        }}
      />
    </React.Fragment>
  );
}

function ChatLoader({
  chatter,
  chatState,
  onLoad,
}: {
  chatter: ChatMessage | null;
  chatState: ChatState;
  onLoad: () => void;
}) {
  if (chatter == null || chatter.hasReachedMax) return <div />;

  if (chatState.status === FormzStatus.submissionInProgress)
    return <CircularProgress />;

  return <Button onClick={onLoad}>{'More messages...'}</Button>;
}

function ChatTextField({
  typeMessage,
  setTypeMessage,
  currentPageId,
  onSend,
}: {
  typeMessage: string;
  setTypeMessage: React.Dispatch<React.SetStateAction<string>>;
  currentPageId: string | null;
  onSend: () => void;
}) {
  const [counter, setCounter] = React.useState(0);

  React.useEffect(() => {
    if (counter === 0) return;
    if (counter > 0) {
      setTimeout(() => {
        setCounter(counter - 1);
      }, 1000);
    }
  }, [counter]);

  return (
    <TextField
      margin={'none'}
      multiline
      minRows={2}
      maxRows={4}
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment style={{ alignItems: 'end' }} position='end'>
            <Button
              disabled={typeMessage == '' || counter > 0}
              onClick={() => {
                typeMessage;
                onSend();
                setCounter(3);
              }}
            >
              {'Send' + (counter > 0 ? `(${counter})` : '')}
            </Button>
          </InputAdornment>
        ),
      }}
      disabled={currentPageId == null}
      value={typeMessage}
      onChange={(e) => setTypeMessage(e.target.value)}
      onKeyPress={(e) => {
        if (counter > 0) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          onSend();
          setCounter(3);
        }
      }}
    />
  );
}
