import Image from 'next/image';
import { WHITELABEL_ENV } from '../../../../config/features';

const getClassName = () => {
  switch (WHITELABEL_ENV) {
    case 'ZK_SYNC':
    case 'BASE':
      return 'opacity-10';
    default:
      return '';
  }
};

const BackgroundImage = ({ src }: { src: string }) => {
  const className = getClassName();
  return (
    <Image
      className={`object-cover ${className}`}
      src={src}
      alt="Background Image"
      fill
    />
  );
};

export default BackgroundImage;
