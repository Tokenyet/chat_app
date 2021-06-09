import { Paper, PaperProps, Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles(({ breakpoints }: Theme) =>
  createStyles({
    root: {
      [breakpoints.up('sm')]: {},
      width: 240,
      height: 320,
      padding: 32,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      '& > :not(:last-child)': {
        marginBottom: 8,
      },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      opacity: 'inherit',
    },
  })
);

// Work with relative scaffold
export default function CenterPaper(props: PaperProps) {
  const classes = useStyles();
  const { className, ...otherProps } = props;
  const rootClass = clsx(classes.root, className);

  return <Paper className={rootClass} {...otherProps} />;
}
