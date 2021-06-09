import React from 'react';
import { createStyles, makeStyles } from '@material-ui/styles';
import clsx from 'clsx';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
    },
  })
);

export default function Scaffold(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) {
  const classes = useStyles();
  const { className, ...otherProps } = props;
  const rootClass = clsx(classes.root, className);
  return <div {...otherProps} className={rootClass} />;
}
