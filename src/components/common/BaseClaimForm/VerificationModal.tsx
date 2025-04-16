'use client';

import { Synaps } from '@synaps-io/verify-sdk';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const VerificationModal = ({
  onVerificationFinished,
}: {
  onVerificationFinished: () => void;
}) => {
  const { data: sessionId } = useGetSessionId();

  useEffect(() => {
    let init = true;
    Synaps.init({
      sessionId: sessionId as string,
      onFinish: () => {
        onVerificationFinished();
      },
      mode: 'modal',
    });
    return () => {
      init = false;
    };
  }, [sessionId, onVerificationFinished]);

  const handleOpen = () => {
    if (!sessionId) return;
    Synaps.show();
  };

  return (
    <div>
      <button onClick={handleOpen} type="button">
        Verify Identity
      </button>
    </div>
  );
};

const useGetSessionId = () => {
  const getSessionId = async () => {
    const response = await fetch('/api/synaps/session', {
      method: 'POST',
      body: JSON.stringify({
        alias: 'BASE',
      }),
    });
    const data = await response.json();
    return data.session_id as string | null;
  };
  return useQuery({
    queryKey: ['sessionId'],
    queryFn: getSessionId,
  });
};
