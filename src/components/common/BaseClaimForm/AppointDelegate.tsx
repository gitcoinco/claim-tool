import { Button, Icon, IconType, Input } from '@gitcoin/ui';

export default function AppointDelegate() {
  return (
    <div className="w-[634px] p-10 rounded-3xl outline outline-1 outline-offset-[-1px] outline-[#bcbfcd] inline-flex flex-col justify-start items-start gap-14">
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch justify-start text-text-primary text-lg font-medium font-ui-sans leading-[25.20px]">
            Choose your delegate
          </div>
          <div className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
            Appoint a delegate to review your milestone and approve your token
            claim. You can choose from the list of approved delegates or
            delegate to yourself.
          </div>
        </div>
        <div className="inline-flex justify-start items-center gap-2">
          <div className="justify-start text-text-primary text-lg font-medium font-ui-sans leading-[25.20px]">
            View all the delegate profiles
          </div>
          <Icon type={IconType.ARROW_RIGHT} className="size-5 -rotate-45" />
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          <div className="self-stretch justify-start text-Black text-lg font-normal font-ui-sans leading-[25.20px]">
            Enter the delegate’s wallet address
          </div>
          <Input
            placeholder="0x......"
            className="w-full text-lg font-normal leading-[25.20px] p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-grey-300"
          />
        </div>
      </div>
      <Button
        value="Delegate"
        variant="primary"
        className="h-14 px-8 bg-[#0d5af9] rounded-[32px] text-base font-medium  leading-normal"
      />
    </div>
  );
}
