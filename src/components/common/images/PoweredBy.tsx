import Image from 'next/image';

import PoweredByImage from '../../../../public/poweredBy.svg';
const PoweredBy = () => {
  return <Image src={PoweredByImage} alt="Powered By" />;
};

export default PoweredBy;
