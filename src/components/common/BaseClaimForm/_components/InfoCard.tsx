export default function InfoCard({
  title,
  description,
}: { title: string; description: string }) {
  return (
    <div className="self-stretch p-10 bg-[#f2f3f8] rounded-3xl inline-flex flex-col justify-start items-start gap-6 w-full min-w-[400px]">
      <div className="justify-start text-text-primary text-xl font-medium font-ui-sans leading-7">
        {title}
      </div>
      <div className="self-stretch justify-start text-text-primary text-lg font-normal font-ui-sans leading-[25.20px]">
        {description}
      </div>
    </div>
  );
}
