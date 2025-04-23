'use client';

import { RiGithubFill } from '@remixicon/react';
import Link from 'next/link';
import { WHITELABEL_ENV } from '../../config/features';
import Gitcoin from './common/images/Gitcoin';
import PoweredBy from './common/images/PoweredBy';
import RaidGuild from './common/images/RaidGuild';
const Footer = () => {
  const isBase = WHITELABEL_ENV === 'BASE';
  return (
    <div className="h-24 border-t border-neutral-200 px-3">
      <div className="h-full mx-auto max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-7">
          {isBase ? (
            <Link href="https://gitcoin.co/" target="_blank">
              <PoweredBy />
            </Link>
          ) : (
            <>
              <Link href="https://gitcoin.co/" target="_blank">
                <Gitcoin />
              </Link>
              <Link href="https://www.raidguild.org/" target="_blank">
                <RaidGuild />
              </Link>
            </>
          )}
        </div>
        <Link href="https://github.com/gitcoinco/claim-tool" target="_blank">
          <RiGithubFill className="w-8 h-8" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
