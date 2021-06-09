import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core';
import React from 'react';
import { Message } from '../../../data/room';

export function ChatTile({
  avatarUrl,
  name,
  latestMessage,
  unreadCount,
  isOnline,
  isSelected,
  onSelect,
}: {
  avatarUrl: string;
  name: string;
  latestMessage: Message | null;
  unreadCount: number;
  isOnline: boolean;
  isSelected: boolean;
  onSelect: () => void;
} & {
  key: string | number | null | undefined;
}) {
  const lastMessage = latestMessage?.message;

  return (
    <ListItem
      style={{ backgroundColor: isSelected ? 'aliceblue' : 'white' }}
      onClick={onSelect}
    >
      <ListItemAvatar>
        <Avatar src={avatarUrl} />
      </ListItemAvatar>
      <ListItemText
        primary={name + (unreadCount == 0 ? '' : `(${unreadCount})`)}
        secondary={lastMessage}
      />
      <ListItemSecondaryAction>
        {isOnline ? 'Online' : 'Offline'}
      </ListItemSecondaryAction>
    </ListItem>
  );
}
