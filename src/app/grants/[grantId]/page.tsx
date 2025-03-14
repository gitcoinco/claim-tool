'use client';
import ClaimCard from '@/components/common/ClaimCard';
import { CurrencySymbol } from '@/components/common/CurrencySymbol';
import { DaysUntilCard } from '@/components/common/DaysUntilCard';
import DelegationInfoCard from '@/components/common/DelegationInfoCard';
import ProjectCard from '@/components/common/ProjectCard';
import { SpinningLoader } from '@/components/common/SpinningLoader';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useGrants } from '@/context/GrantsContext';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FEATURES } from '../../../../config/features';

const { DELEGATION_ENABLED } = FEATURES;

const GrantPage = () => {
  const { grantId } = useParams();
  const { grants, isLoading, isFetched } = useGrants();
  const grant = grants.find((grant) => grant.id === grantId);

  if (!isFetched || isLoading) {
    return <SpinningLoader />;
  }

  if (!isLoading && grant) {
    return (
      <div className="bg-white p-8 rounded-lg">
        <Link
          href="/grants"
          className="text-sm text-gray-500 flex items-center gap-2 mb-8"
        >
          <ChevronLeft className="" />
          <span>Back to all grants</span>
        </Link>
        <h2 className="text-lg font-semibold mb-4">You're claiming</h2>
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <span className="bg-neutral-200 rounded-md p-3">{grant?.title}</span>
          with
          <span className="bg-neutral-200 rounded-md p-3 flex items-center gap-2 w-fit">
            <CurrencySymbol token={grant?.campaign.token} />
            {grant?.grantAmount} {grant?.campaign.token?.ticker}
          </span>
        </h1>
        {FEATURES.CONFIRMATION_SUBHEADER.length > 0 && (
          <div className="text-lg font-semibold pt-3">
            {FEATURES.CONFIRMATION_SUBHEADER}
          </div>
        )}
        <div className="pt-14 flex items-start gap-8">
          <div className="w-3/5">
            <ClaimCard grant={grant} />
          </div>
          <div className="flex flex-col gap-4 w-2/5">
            <ProjectCard grant={grant} />
            <DaysUntilCard grant={grant} />
            {DELEGATION_ENABLED && <DelegationInfoCard />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex items-center justify-center">
      <CardHeader>
        <CardTitle>Grant not found</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default GrantPage;
