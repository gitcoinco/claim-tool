import type { Grant } from '@/context/GrantsContext';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import GrantCard from './GrantCard';

const GrantsList = ({
  grants,
}: {
  grants: Grant[];
  isClaimDialogOpen?: boolean;
  onSelectGrant?: (id: string) => void;
}) => {
  if (grants.length === 0) {
    return (
      <Card className="border-none flex items-center justify-center py-10">
        <CardHeader>
          <CardTitle>No grants found</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {grants.map((grant) => (
        <GrantCard key={`${grant.id}-${grant.address}`} grant={grant} />
      ))}
    </div>
  );
};

export default GrantsList;
