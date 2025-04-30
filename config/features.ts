import colors from 'tailwindcss/colors';
import {
  base,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
  zksync,
  zksyncSepoliaTestnet,
} from 'wagmi/chains';

type WHITELABEL_ENV = 'OPTIMISM' | 'ZK_SYNC' | 'SUNNY';

const _WHITELABEL_ENV = process.env.NEXT_PUBLIC_WHITELABEL_ENV;

if (!_WHITELABEL_ENV) {
  throw new Error('NEXT_PUBLIC_WHITELABEL_ENV is not set');
}

if (
  !(
    _WHITELABEL_ENV === 'OPTIMISM' ||
    _WHITELABEL_ENV === 'ZK_SYNC' ||
    _WHITELABEL_ENV === 'SUNNY'
  )
) {
  throw new Error('NEXT_PUBLIC_WHITELABEL_ENV is not set to a valid value');
}

export const WHITELABEL_ENV = _WHITELABEL_ENV;

interface Features {
  APP_NAME: string;
  BG_IMAGE: {
    src: string;
  };
  DELEGATION_REQUIRED: boolean;
  DELEGATION_ENABLED: boolean;
  DELEGATES_URL?: string;
  CONFIRMATION_CHECKMARK_BG_COLOR: string;
  INTRO_TEXT: string;
  ONLY_SHOW_CLAIMABLE: boolean;
  CONFIRMATION_SUBHEADER: string;
  CONFIRMATION_SECOND_BUTTON_TEXT: string;
  CONFIRMATION_SECOND_BUTTON_LINK: string;
  CLAIM_FEE: boolean;
}

const featureMatrix: Record<WHITELABEL_ENV, Features> = {
  OPTIMISM: {
    APP_NAME: 'OP Claim Tool',
    BG_IMAGE: {
      src: '/optimism-bg-img.svg',
    },
    DELEGATION_REQUIRED: false,
    DELEGATION_ENABLED: false,
    DELEGATES_URL: 'https://vote.optimism.io/delegates',
    CONFIRMATION_CHECKMARK_BG_COLOR: '#68DFDC',
    INTRO_TEXT:
      "Explore all grants from the OP Citizen Grants Council and who they've delegated to. For grantees, this claiming tool offers a self-serve interface to claim and delegate your grant.",
    ONLY_SHOW_CLAIMABLE: false,
    CONFIRMATION_SUBHEADER:
      'We strongly encourage you to set a delegate to represent you in Optimism governance.',
    CONFIRMATION_SECOND_BUTTON_TEXT: 'Choose your representative',
    CONFIRMATION_SECOND_BUTTON_LINK: 'https://vote.optimism.io/delegates',
    CLAIM_FEE: false,
  },
  ZK_SYNC: {
    APP_NAME: 'ZKsync Claim Tool',
    BG_IMAGE: {
      src: '/zksync-bg-img.svg',
    },
    DELEGATION_REQUIRED: true,
    DELEGATION_ENABLED: true,
    DELEGATES_URL: 'https://vote.zknation.io/dao/delegates',
    CONFIRMATION_CHECKMARK_BG_COLOR: 'black',
    INTRO_TEXT:
      "Explore the grants you are eligible from the ZKsync foundation and who they've delegated to. For grantees, this claiming tool offers a self-serve interface to claim and delegate your grant.",
    ONLY_SHOW_CLAIMABLE: true,
    CONFIRMATION_SUBHEADER: '',
    CONFIRMATION_SECOND_BUTTON_TEXT: '',
    CONFIRMATION_SECOND_BUTTON_LINK: '',
    CLAIM_FEE: true,
  },
  SUNNY: {
    APP_NAME: 'The Sunny Awards',
    BG_IMAGE: {
      src: '',
    },
    DELEGATION_REQUIRED: false,
    DELEGATION_ENABLED: false,
    DELEGATES_URL: 'https://vote.zknation.io/dao/delegates',
    CONFIRMATION_CHECKMARK_BG_COLOR: 'black',
    INTRO_TEXT:
      'Celebrate onchain Summer 2024 and explore the grants from the Sunny Awards. For grantees, this claiming tool offers a self-serve interface to claim your grant.',
    ONLY_SHOW_CLAIMABLE: false,
    CONFIRMATION_SUBHEADER: '',
    CONFIRMATION_SECOND_BUTTON_TEXT: '',
    CONFIRMATION_SECOND_BUTTON_LINK: '',
    CLAIM_FEE: true,
  },
};

export const FEATURES = featureMatrix[_WHITELABEL_ENV];

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('WalletConnect Project ID is not defined');
}

export const getChainConfig = () => {
  switch (WHITELABEL_ENV) {
    case 'OPTIMISM':
      return {
        appName: 'OP Claim Tool',
        chains: [mainnet, optimism, optimismSepolia, sepolia],
      };
    case 'ZK_SYNC':
      return {
        appName: 'ZKsync Claim Tool',
        chains: [mainnet, zksync, zksyncSepoliaTestnet],
      };
    case 'SUNNY':
      return {
        appName: 'Sunny Claim Tool',
        chains: [mainnet, optimism, optimismSepolia, sepolia],
      };
  }
};

interface WhitelabelThemeColors {
  bgClaimcardHeader: string;
  primaryAction: string;
  primaryActionButtonBg: string;
}

export const getWhitelabelThemeColors = (): WhitelabelThemeColors => {
  switch (WHITELABEL_ENV) {
    case 'OPTIMISM':
      return {
        bgClaimcardHeader: colors.red[200],
        primaryAction: colors.red[500],
        primaryActionButtonBg: colors.red[600],
      };
    case 'ZK_SYNC':
      return {
        bgClaimcardHeader: colors.blue[200],
        primaryAction: colors.blue[500],
        primaryActionButtonBg: colors.blue[900],
      };
  }
};
