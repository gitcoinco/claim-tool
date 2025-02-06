import { Hexagon } from 'lucide-react';

export const ProjectImage = ({ src: image }: { src?: string }) => {
  if (image) {
    return <img src={image} alt="Project logo" className="h-20 w-20 rounded" />;
  }

  return <Hexagon className="h-20 w-20 rounded" />;
};
