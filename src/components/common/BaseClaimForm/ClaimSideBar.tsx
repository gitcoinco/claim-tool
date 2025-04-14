'use client';

import { useState } from 'react';

import { AlertCircle, CheckIcon, Circle, Clock } from 'lucide-react';

import ProjectCard from '@/components/common/ProjectCard';
import type { Grant } from '@/context/GrantsContext';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@gitcoin/ui';
import AppointDelegate from './AppointDelegate';
import ClaimCard from './ClaimCard';
import { KYC_Tab } from './KYC_Tab';
import InfoCard from './_components/InfoCard';
const defaultSideNavTabs: SideNavTab[] = [
  {
    status: 'COMPLETED',
    name: 'KYC',
    content: <KYC_Tab />,
  },
  {
    status: 'COMPLETED',
    name: 'Appoint Delegate',
    content: <AppointDelegate />,
  },
  {
    status: 'COMPLETED',
    name: 'Claim',
    content: <ClaimCard />,
  },
];

export interface SideNavTab {
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ERROR' | 'PENDING';
  name: string;
  content: React.ReactNode;
  rules?: {
    isRequired?: boolean;
    errorMessage?: string;
  };
}

export interface ProgressFormProps {
  steps?: SideNavTab[];
  grant: Grant;
}

export const ClaimSideBar = ({
  steps = defaultSideNavTabs,
  grant,
}: ProgressFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const progressValue = (currentStep / steps.length) * 100;

  const isStepAccessible = (index: number): boolean => {
    if (index === 0) return true; // KYC is always accessible

    // Tax Validation requires KYC to be completed
    if (index === 1) {
      return steps[0].status === 'COMPLETED';
    }

    // Appoint Delegate and Claim require both KYC and Tax Validation to be completed
    if (index >= 2) {
      return steps[0].status === 'COMPLETED' && steps[1].status === 'COMPLETED';
    }

    return false;
  };

  const getStatusIcon = (status: SideNavTab['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckIcon className="size-5 text-moss-700" />;
      case 'ERROR':
        return <AlertCircle className="size-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="size-5 text-gray-400 fill-gray-400" />;
      case 'IN_PROGRESS':
        return <Circle className="size-5 text-blue-500 fill-blue-500" />;
      default:
        return <Circle className="size-5 text-gray-400 fill-gray-400" />;
    }
  };

  return (
    <div className="flex items-start justify-center gap-14 pt-16">
      <div className="flex w-[228px] flex-col gap-6">
        <div>Claim grant</div>
        <ProgressBar value={progressValue} variant="base" withLabel />
        {steps.map((step, index) => {
          const isSelected = index === currentStep;
          const isAccessible = isStepAccessible(index);

          return (
            <div
              key={step.name}
              className={cn(
                'flex items-start gap-2',
                isAccessible
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-50',
                isSelected && 'cursor-default',
              )}
              onClick={() => {
                if (isAccessible) {
                  setCurrentStep(index);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (isAccessible) {
                    setCurrentStep(index);
                  }
                }
              }}
            >
              <div className="flex size-5 shrink-0 justify-center mt-1">
                {getStatusIcon(step.status)}
              </div>
              <span
                className={cn(
                  'font-ui-sans text-p font-normal leading-7',
                  isAccessible ? 'text-black' : 'text-gray-400',
                  isSelected && 'font-medium',
                )}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex rounded-2xl bg-grey-50">
        {steps[currentStep].content}
      </div>
      <div className="flex flex-col gap-1 w-[434px]">
        <ProjectCard grant={grant} variant="base" />
        <InfoCard
          title="Why appoint a delegate?"
          description="To claim your milestone, you must first appoint a delegate. Delegates
        act as trusted reviewers who confirm your eligibility to receive grant
        funds. This process ensures transparency, accountability, and alignment
        with the grant program’s requirements. You can choose from the list of
        approved delegates or delegate to yourself."
        />
      </div>
    </div>
  );
};
