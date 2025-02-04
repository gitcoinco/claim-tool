import Image from 'next/image';
import { WHITELABEL_ENV } from '../../../../config/features';
import BaseLogo from '../../../../public/base-logo_dark.svg';
import OpLogo from '../../../../public/op-logo.svg';
import ZkSyncLogo from '../../../../public/zksync_logo_dark.svg';
const Logo = () => {
  switch (WHITELABEL_ENV) {
    case 'OPTIMISM':
      return <Image src={OpLogo} alt="OP Logo" />;
    case 'ZK_SYNC':
      return <Image src={ZkSyncLogo} alt="ZKSync Logo" height={40} />;
    case 'BASE':
      return <Image src={BaseLogo} alt="Base Logo" height={40} />;
    default:
      throw new Error('Invalid WHITE_LABEL_ENV');
  }
};

export default Logo;
