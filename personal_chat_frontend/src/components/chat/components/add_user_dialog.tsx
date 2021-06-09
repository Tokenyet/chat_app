import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogProps,
  DialogTitle,
  TextField,
} from '@material-ui/core';

export function AddUserDialog(
  props: DialogProps & { onNameSubmit: (v: string) => void }
) {
  const [name, setName] = React.useState('');

  return (
    <Dialog {...props}>
      <DialogTitle>{'Please enter an username'}</DialogTitle>
      <div style={{ paddingLeft: 24, paddingRight: 24 }}>
        <TextField
          variant={'standard'}
          placeholder={'ex. John'}
          fullWidth
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </div>
      <DialogActions>
        <Button
          autoFocus
          disabled={name == ''}
          onClick={() => {
            props.onNameSubmit(name);
          }}
        >
          add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
