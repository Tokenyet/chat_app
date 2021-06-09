import { CircularProgress } from '@material-ui/core';
import React from 'react';

interface FetchableListProps {
  canFetch: boolean;
  fetch: () => void;
  isReachedMax?: boolean;
  fetchMoreWidget?: React.ReactNode;
  children: React.ReactNode;
  throttle?: number;
}

export default function FetchableList({
  canFetch,
  fetch,
  fetchMoreWidget,
  isReachedMax,
  children,
  throttle = 300,
}: FetchableListProps) {
  const handleScroll = React.useCallback(() => {
    if (canFetch && !isReachedMax) {
      const position = window.pageYOffset;
      const bottomPositon =
        window.document.body.scrollHeight - window.innerHeight - throttle;
      if (position > bottomPositon) fetch();
    }
  }, [canFetch]);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <React.Fragment>
      {children}
      {!isReachedMax ? (
        fetchMoreWidget ? (
          fetchMoreWidget
        ) : (
          <div
            style={{
              boxShadow: '0px 3px 6px #00000029',
              borderRadius: 16,
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <CircularProgress />
          </div>
        )
      ) : (
        <React.Fragment />
      )}
    </React.Fragment>
  );
}
