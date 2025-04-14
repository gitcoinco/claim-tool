export default function ProjectCard({
  projectName = 'Party Protocol',
  projectLogo = '/partyProj.svg',
}: {
  projectName?: string;
  projectLogo?: string;
}) {
  return (
    <div className="self-stretch p-10 bg-neutral-100 rounded-3xl inline-flex flex-col justify-start items-start gap-6">
      <div className="justify-start text-text-primary text-xl font-medium font-['Coinbase_Sans'] leading-7">
        Your project
      </div>
      <div className="self-stretch inline-flex justify-start items-center gap-8">
        <img
          className="w-20 h-20 relative rounded-lg"
          src={projectLogo}
          alt="Project Logo"
        />
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
          <div className="self-stretch justify-start text-Black text-xl font-medium font-['Coinbase_Sans'] leading-7">
            {projectName}
          </div>
        </div>
      </div>
    </div>
  );
}
