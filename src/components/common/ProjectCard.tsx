import { Card, CardContent } from '@/components/ui/card';
import type { Grant } from '@/context/GrantsContext';
import { tv } from 'tailwind-variants';

const projectCard = tv({
  slots: {
    container: 'w-full border-black shadow-none bg-transparent flex flex-col',
    content: 'py-8 px-10 flex flex-col gap-6',
    title: 'text-lg font-semibold',
    image: 'size-12 mr-4',
    baseContainer:
      'self-stretch p-10 bg-neutral-100 rounded-3xl inline-flex flex-col justify-start items-start gap-6',
    baseTitle:
      'justify-start text-text-primary text-xl font-medium font-ui-sans leading-7',
    baseImage: 'size-12 relative rounded-lg',
    baseContent: 'self-stretch inline-flex justify-start items-center gap-8',
    baseText: 'flex-1 inline-flex flex-col justify-start items-start gap-2',
    baseProjectTitle:
      'self-stretch justify-start text-Black text-xl font-medium font-ui-sans leading-7',
  },
  variants: {
    variant: {
      default: {
        container: 'w-full border-black shadow-none bg-transparent',
        content: 'py-8 px-10 space-y-6',
        title: 'text-lg font-semibold',
        image: 'size-12 mr-4',
      },
      base: {
        container:
          'self-stretch p-8 bg-neutral-100 rounded-3xl inline-flex flex-col justify-start items-start gap-6 border-none',
        content: 'flex items-start justify-start gap-8 p-0',
        title:
          'justify-start text-text-primary text-xl font-medium font-ui-sans leading-7',
        image: 'size-12 relative rounded-lg',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const ProjectCard = ({
  grant,
  variant = 'default',
}: { grant: Grant; variant?: 'default' | 'base' }) => {
  const styles = projectCard({ variant });

  return (
    <Card className={styles.container()}>
      <CardContent className={styles.content()}>
        <p>Your project</p>
        <div className="flex items-center">
          <img
            className={styles.image()}
            alt="Project logo"
            src={grant.projectImage}
          />
          <p className={styles.title()}>{grant.title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
