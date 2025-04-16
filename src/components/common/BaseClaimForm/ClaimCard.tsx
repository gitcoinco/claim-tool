import { Button } from '@gitcoin/ui';

export default function ClaimCard() {
  return (
    <div className="w-[634px] p-10 rounded-3xl outline outline-1 outline-offset-[-1px] outline-[#bcbfcd] inline-flex flex-col justify-start items-start gap-14">
      <div className="self-stretch justify-start text-Black text-lg font-normal font-ui-sans leading-[25.20px]">
        Excellent. You are now ready to claim your rewards.
      </div>
      <Button
        value="Claim"
        variant="primary"
        className="h-14 px-8 bg-[#0d5af9] rounded-[32px] text-base font-medium  leading-normal"
      />
    </div>
  );
}
