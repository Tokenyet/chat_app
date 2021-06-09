import { Avatar, Theme, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import React from 'react';

export interface ChatMessageTileProps {
  avatarUrl: string;
  message: string;
  createdAt: Date;
  self?: boolean;
  key: string | number | null | undefined;
}

export function ChatMessageTile(props: ChatMessageTileProps) {
  return props.self ? (
    <RightChatMessageTile {...props} />
  ) : (
    <LeftChatMessageTile {...props} />
  );
}

type ChatMessageTileStyleProps = {
  isLeft: boolean;
};

const useStyles = makeStyles<Theme, ChatMessageTileStyleProps>(() =>
  createStyles({
    messageBox: {
      display: 'flex',
      marginBottom: 16,
    },
    messageBody: {
      borderRadius: 14,
      borderTopLeftRadius: ({ isLeft }) => (isLeft ? 0 : 14),
      borderTopRightRadius: ({ isLeft }) => (isLeft ? 14 : 0),
      padding: 16,
      paddingBottom: 24,
      marginLeft: ({ isLeft }) => (isLeft ? 16 : 0),
      marginRight: ({ isLeft }) => (isLeft ? 0 : 16),
      backgroundColor: ({ isLeft }) => (isLeft ? 'aliceblue' : 'beige'),
      maxWidth: '30vw',
      minWidth: '10vw',
      position: 'relative',
    },
    messageTimestamp: {
      position: 'absolute',
      right: 10,
      bottom: 4,
    },
  })
);

export function LeftChatMessageTile(props: ChatMessageTileProps) {
  const classes = useStyles({ isLeft: true });
  return (
    <div key={props.key} className={classes.messageBox}>
      <Avatar src={props.avatarUrl} />
      <div className={classes.messageBody}>
        {props.message}
        <div style={{ position: 'absolute', right: 10, bottom: 10 }}>
          <Typography variant={'caption'}>
            {props.createdAt.toDateString()}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export function RightChatMessageTile(props: ChatMessageTileProps) {
  const classes = useStyles({ isLeft: false });
  return (
    <div key={props.key} className={classes.messageBox}>
      <div style={{ flexGrow: 1 }} />
      <div className={classes.messageBody}>
        {props.message}
        <div className={classes.messageTimestamp}>
          <Typography variant={'caption'}>
            {props.createdAt.toDateString()}
          </Typography>
        </div>
      </div>
      <Avatar src={props.avatarUrl} />
    </div>
  );
}
