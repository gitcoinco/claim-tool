'use client';

import { useEffect, useState } from 'react';

import { Button } from '@gitcoin/ui';
import { Synaps } from '@synaps-io/verify-sdk';
import { useQuery } from '@tanstack/react-query';
export interface SynapsVerificationFormControllerProps {
  name: string;
}

export const KYC_Tab = () => {
  const [isVerified, setIsVerified] = useState(false);
  const handleVerificationFinished = () => {
    setIsVerified(true);
  };
  return (
    <div className="w-[634px] p-10 rounded-3xl outline outline-1 outline-offset-[-1px] outline-[#bcbfcd] inline-flex flex-col justify-start items-start gap-14">
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch justify-start text-text-primary text-lg font-medium font-ui-sans leading-[25.20px]">
            KYC Verification
          </div>
          <div className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
            To claim your grant, you'll need to complete identity verification.
            This helps ensure compliance and secure fund distribution.
          </div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
            What to expect:
          </div>
          <ul className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
            <li className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
              You'll be redirected to Synaps to verify your identity.
            </li>
            <li className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
              This process typically takes a few minutes.
            </li>
            <li className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
              Base does not store your personal information.
            </li>
          </ul>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
            Next step:
          </div>
          <div className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
            Click "Verify Identity" to begin. Once completed, you'll return here
            to continue the claiming process.
          </div>
        </div>
      </div>
      <VerificationModal onVerificationFinished={handleVerificationFinished} />
    </div>
  );
};

const VerificationModal = ({
  onVerificationFinished,
}: {
  onVerificationFinished: () => void;
}) => {
  const { data: sessionId } = useGetSessionId();
  console.log('sessionId', sessionId);

  useEffect(() => {
    // Prevent multiple initializations with react strict mode
    // https://react.dev/learn/synchronizing-with-effects#fetching-data
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
    if (!sessionId) {
      return;
    }
    console.log('sessionId', sessionId);
    Synaps.show();
  };

  return (
    <Button
      value="Verify identity"
      variant="primary"
      className="h-14 px-8 bg-[#0d5af9] rounded-[32px] text-base font-medium  leading-normal"
      onClick={handleOpen}
    />
  );
};

export const useGetSessionId = () => {
  const getSessionId = async () => {
    const response = await fetch('/api/synaps/session', {
      method: 'POST',
      body: JSON.stringify({
        alias: 'BASE',
      }),
    });
    const sessionId = await response.json();
    console.log('data2', sessionId);
    return sessionId as string | null;
  };
  return useQuery({
    queryKey: ['sessionId'],
    queryFn: getSessionId,
  });
};
