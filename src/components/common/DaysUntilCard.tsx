import React from 'react';
import { WHITELABEL_ENV } from '../../../config/features';
import type { Grant } from '../../context/GrantsContext';
import { Card, CardContent } from '../ui/card';

export const DaysUntilCard = ({ grant }: { grant: Grant }) => {
  const cardBackground =
    WHITELABEL_ENV === 'BASE' ? 'bg-blue-100' : 'bg-[#FFE6C7]';

  if (!grant.tokenReleasedInDays) return null;

  return (
    <Card className={`w-[424px] shadow-none ${cardBackground}`}>
      <CardContent className="py-2">
        <p className="flex justify-center">
          The token will be fully released in:
          <span className="font-bold ml-1">
            {grant.tokenReleasedInDays}{' '}
            {grant.tokenReleasedInDays === 1 ? 'day' : 'days'}
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
