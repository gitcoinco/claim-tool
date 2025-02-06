import { Card, CardContent } from '@/components/ui/card';
import type { Grant } from '@/context/GrantsContext';

const ProjectCard = ({ grant }: { grant: Grant }) => {
  return (
    <Card className="w-full shadow-none bg-[#f7f7f7] border-none">
      <CardContent className="py-8 px-10 space-y-6">
        <p className="text-xl font-medium">Your project</p>
        <div className="flex items-center">
          <img
            className="h-20 mr-4 rounded-md"
            alt="Project logo"
            src={grant.projectImage}
          />
          <p className="text-lg font-semibold">{grant.title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
